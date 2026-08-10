import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, generateText, type UIMessage } from "ai";
import { z } from "zod";
import {
  getChatModel,
  generateAdImage,
  analyzeWebsite,
  isAiConfigured,
} from "@/lib/ai-gateway.server";

const BASE_SYSTEM = `You are Growzzy, an autonomous ad-campaign strategist inside the Growzzy OS platform. Growzzy builds Google Ads campaigns (Meta support is coming soon, so default to Google Ads unless the user explicitly asks otherwise).

Your job: turn a business request into a complete, launch-ready ad campaign.

Workflow — follow it strictly, one tool at a time:
1. ANALYSE the request together with the BRAND CONTEXT below. The brand context is the source of truth for the business, product, audience and tone — treat it as already answered and NEVER ask the user to re-state anything it already contains (do not ask what the business is, what they sell, or who their customer is when that is provided).
2. If the user gives a website URL (or one is in the brand context) and you don't already have a deep analysis of it, call analyzeWebsite to fetch and study the real site before planning.
3. Only if something genuinely material is still missing (e.g. budget, geography, campaign goal, landing page), call askUser ONCE with 1–3 short, question-wise doubts, each with 2–4 concrete options plus a recommended one. If everything needed is known, skip this step entirely.
4. Call research for market, competitors, keywords, creative angles and benchmarks. Use the returned notes in your reasoning.
5. Call proposePlan with a step-by-step execution plan (4–7 steps) and wait for the user's approval. Do not build anything before approval.
6. After approval: call generateCreative once (a vivid, brand-appropriate ad visual prompt), then call deliverCampaign with the complete campaign package.
7. Finish with a short markdown summary (use tables for ad copy variations) and 2–3 next-step suggestions.

Rules:
- Be concise and concrete. No filler, no restating the brief.
- Respect the brand's tone of voice in all ad copy.
- Never invent platform metrics as facts; frame benchmarks as estimates.
- All money figures use the brand/user currency if stated, otherwise USD.`;

const NO_BRAND_NOTE = `\n\nBRAND CONTEXT: none saved yet. The user has not filled in "My Brand", so infer what you can from their message and ask for what is genuinely missing.`;

function buildSystem(brandContext?: string | null): string {
  if (brandContext && brandContext.trim()) {
    return `${BASE_SYSTEM}\n\n--- BRAND CONTEXT (the user's saved business profile) ---\n${brandContext.trim()}\n--- END BRAND CONTEXT ---`;
  }
  return BASE_SYSTEM + NO_BRAND_NOTE;
}

const questionSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().describe("short slug, e.g. 'budget'"),
        question: z.string(),
        why: z.string().describe("one line on why this matters"),
        options: z.array(
          z.object({
            label: z.string(),
            description: z.string(),
            recommended: z.boolean(),
          }),
        ),
      }),
    )
    .describe("2-4 clarifying doubts"),
});

/** Replaces base64 creative data URLs in history with a short placeholder. */
function stripCreativeImages(messages: UIMessage[]): UIMessage[] {
  return messages.map((m) => ({
    ...m,
    parts: m.parts.map((p) => {
      const part = p as { type?: string; output?: { imageUrl?: string | null } };
      if (part.type === "tool-generateCreative" && part.output?.imageUrl) {
        return { ...p, output: { ...part.output, imageUrl: "[image shown to the user]" } };
      }
      return p;
    }),
  })) as UIMessage[];
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, brandContext } = (await request.json()) as {
          messages?: UIMessage[];
          brandContext?: string | null;
        };
        if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });

        if (!isAiConfigured()) return new Response("AI is not configured yet.", { status: 500 });

        const model = getChatModel();

        const result = streamText({
          model,
          system: buildSystem(brandContext),
          messages: await convertToModelMessages(stripCreativeImages(messages)),
          stopWhen: stepCountIs(50),
          tools: {
            analyzeWebsite: tool({
              description:
                "Fetch the user's real website and produce a grounded analysis of their business, offer, audience, positioning, competitors, ad angles and keywords. Use before planning when a URL is available.",
              inputSchema: z.object({
                url: z.string().describe("the website URL to analyse"),
              }),
              execute: async ({ url }) => {
                const { result: analysis, error } = await analyzeWebsite(url);
                if (error || !analysis) {
                  return { url, ok: false, error: error ?? "Analysis failed." };
                }
                return { url: analysis.url, ok: true, title: analysis.title, analysis: analysis.analysis };
              },
            }),
            research: tool({
              description:
                "Research the market, audience, competitors, keywords and creative angles for the brief. Returns concise notes.",
              inputSchema: z.object({
                focus: z.string().describe("what is being researched, shown to the user"),
                topics: z.array(z.string()).describe("3-6 research topics"),
              }),
              execute: async ({ focus, topics }) => {
                const { text } = await generateText({
                  model,
                  system:
                    "You are a performance-marketing research analyst. Answer with tight bullet notes only: audience segments, buying triggers, competitor angles, 8-12 high-intent keywords, creative hooks, and realistic CPC/CTR/CPA ranges labelled as estimates.",
                  prompt: `Focus: ${focus}\nTopics:\n${topics.map((t) => `- ${t}`).join("\n")}`,
                });
                return { focus, notes: text };
              },
            }),
            askUser: tool({
              description:
                "Ask the user your clarifying doubts before planning. The user answers in the UI.",
              inputSchema: questionSchema,
            }),
            proposePlan: tool({
              description:
                "Show the execution plan and wait for the user to approve it or request changes.",
              inputSchema: z.object({
                title: z.string(),
                summary: z.string(),
                steps: z.array(
                  z.object({
                    title: z.string(),
                    detail: z.string(),
                  }),
                ),
              }),
            }),
            generateCreative: tool({
              description: "Generate the ad creative image that will be used in the campaign.",
              inputSchema: z.object({
                prompt: z.string().describe("detailed art-direction prompt for the ad visual"),
                caption: z.string().describe("short label for the creative"),
              }),
              // Keep the base64 image out of the model context — the UI renders it.
              toModelOutput: (output) => ({
                type: "text" as const,
                value: (output as { imageUrl?: string | null }).imageUrl
                  ? "Ad creative generated and shown to the user."
                  : "Creative generation failed.",
              }),
              execute: async ({ prompt, caption }) => {
                const { url, error } = await generateAdImage(
                  `High-converting advertising creative, square 1:1, clean commercial photography or modern graphic design, space for a headline, no gibberish text. ${prompt}`,
                );
                return url
                  ? { caption, imageUrl: url }
                  : {
                      caption,
                      imageUrl: null,
                      error: `Creative generation failed (${error ?? "unknown"}). Continue without a visual or retry later.`,
                    };
              },
            }),
            deliverCampaign: tool({
              description: "Deliver the complete, launch-ready campaign package.",
              inputSchema: z.object({
                name: z.string(),
                platform: z.string(),
                objective: z.string(),
                budgetDaily: z.number(),
                currency: z.string(),
                bidding: z.string(),
                schedule: z.string(),
                landingPage: z.string(),
                targeting: z.array(z.object({ setting: z.string(), value: z.string() })),
                keywords: z.array(z.string()),
                headlines: z.array(z.string()),
                descriptions: z.array(z.string()),
                primaryText: z.string(),
                cta: z.string(),
                kpis: z.array(z.object({ metric: z.string(), target: z.string() })),
                risks: z.array(z.string()),
              }),
              execute: async (input) => ({ delivered: true, name: input.name }),
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: (error) => {
            const raw = error instanceof Error ? error.message : String(error);
            console.log("[v0] chat stream error:", raw);
            if (/credit card|valid credit card|billing/i.test(raw)) {
              return "AI Gateway needs billing enabled. Add a credit card to your Vercel team's AI Gateway (Vercel → AI → Add card) to unlock free credits, then try again.";
            }
            if (/quota|rate limit|429/i.test(raw)) {
              return "The AI provider is rate-limited right now. Please try again in a moment.";
            }
            return `Growzzy couldn't reach the AI model: ${raw}`;
          },
        });
      },
    },
  },
});
