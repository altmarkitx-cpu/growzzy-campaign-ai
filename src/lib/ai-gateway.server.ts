import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { gateway } from "ai";
import { generateText, type LanguageModel } from "ai";

export const CHAT_MODEL = "google/gemini-2.5-flash";
export const IMAGE_MODEL = "google/gemini-2.5-flash-image";

/**
 * Resolves which AI backend to use.
 * - On Lovable's platform, LOVABLE_API_KEY points at Lovable's AI gateway.
 * - Everywhere else (v0 / Vercel), fall back to the Vercel AI Gateway, which is
 *   zero-config when AI_GATEWAY_API_KEY is present.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"] || process.env["AI_GATEWAY_API_KEY"]);
}

function lovableKey(): string | undefined {
  return process.env["LOVABLE_API_KEY"];
}

function createLovableProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Returns the chat language model for the active backend. */
export function getChatModel(): LanguageModel {
  const key = lovableKey();
  if (key) return createLovableProvider(key)(CHAT_MODEL);
  // Vercel AI Gateway (uses AI_GATEWAY_API_KEY automatically).
  return gateway(CHAT_MODEL);
}

/** Generates one ad creative image and returns it as a data URL. */
export async function generateAdImage(prompt: string): Promise<{ url: string | null; error?: string }> {
  const key = lovableKey();

  // Lovable path: their chat-completions endpoint returns an image on the message.
  if (key) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[growzzy] image generation failed", res.status, detail.slice(0, 300));
      return { url: null, error: `Image service returned ${res.status}` };
    }
    const data = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
    if (!url) console.error("[growzzy] image generation returned no image");
    return { url, error: url ? undefined : "No image returned" };
  }

  // Vercel AI Gateway path: the image model returns files on the result.
  try {
    const { files } = await generateText({
      model: gateway(IMAGE_MODEL),
      providerOptions: { google: { responseModalities: ["TEXT", "IMAGE"] } },
      prompt,
    });
    const image = files?.find((f) => f.mediaType?.startsWith("image/"));
    if (!image) {
      console.error("[growzzy] image generation returned no image");
      return { url: null, error: "No image returned" };
    }
    const url = `data:${image.mediaType};base64,${image.base64}`;
    return { url };
  } catch (e) {
    console.error("[growzzy] image generation failed", e);
    return { url: null, error: "Image generation failed" };
  }
}

/* --------------------------- website analysis ---------------------------- */

/** Normalises a user-typed URL into something fetchable. */
export function normalizeUrl(input: string): string | null {
  let u = (input ?? "").trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Very small HTML → text reducer: keeps title, meta description and body text. */
export function extractReadable(html: string): { title: string; description: string; text: string } {
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  const description =
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i.exec(html)?.[1]?.trim() ??
    /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(html)?.[1]?.trim() ??
    "";
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title, description, text };
}

const ANALYSIS_SYSTEM =
  "You are a senior performance-marketing strategist analysing a real business website. " +
  "Base every statement ONLY on the provided page content — never invent facts. " +
  "Return tight markdown with these sections (short bullets, no preamble): " +
  "**Business** (what they do in one line), " +
  "**Core offer(s)** (products/services + any pricing signals), " +
  "**Target audience** (who it's for), " +
  "**Positioning & differentiators** (why choose them), " +
  "**Brand tone** (how the copy sounds), " +
  "**Likely competitors** (category-level), " +
  "**Ad angles to test** (4-6 concrete hooks for paid campaigns), " +
  "**High-intent keywords** (8-12). " +
  "If the page is thin or unclear, say so under the relevant section rather than guessing.";

export interface WebsiteAnalysis {
  url: string;
  title: string;
  analysis: string;
  analyzedAt: string;
}

/**
 * Fetches a real website and produces a grounded marketing analysis.
 * Shared by the /api/analyze-site route and the chat's analyzeWebsite tool.
 */
export async function analyzeWebsite(
  rawUrl: string,
): Promise<{ result?: WebsiteAnalysis; error?: string; status?: number }> {
  const url = normalizeUrl(rawUrl);
  if (!url) return { error: "Enter a valid website URL first.", status: 400 };
  if (!isAiConfigured()) return { error: "AI is not configured yet.", status: 500 };

  let html = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GrowzzyBot/1.0; +https://growzzy.ai) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      return { error: `Couldn't load that site (HTTP ${res.status}). Check the URL and try again.`, status: 422 };
    }
    html = await res.text();
  } catch {
    return {
      error: "Couldn't reach that website — it may be down, blocking bots, or the URL is wrong.",
      status: 422,
    };
  }

  const { title, description, text } = extractReadable(html);
  const corpus = `URL: ${url}\nTitle: ${title}\nMeta description: ${description}\n\nPage text:\n${text.slice(0, 12000)}`;

  try {
    const { text: analysis } = await generateText({
      model: getChatModel(),
      system: ANALYSIS_SYSTEM,
      prompt: corpus,
    });
    return { result: { url, title, analysis: analysis.trim(), analyzedAt: new Date().toISOString() } };
  } catch {
    return { error: "Analysis failed — try again in a moment.", status: 502 };
  }
}
