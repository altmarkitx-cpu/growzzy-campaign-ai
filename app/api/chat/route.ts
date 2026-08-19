import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const runtime = "nodejs";

const SYSTEM = "You are Growzzy, a concise marketing assistant for Google Ads and Meta Ads. Answer questions directly. When asked to build a campaign, help clarify the brief and propose practical next steps. Never invent live campaign metrics or claim a provider is connected.";

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: UIMessage[]; brandContext?: string };
  if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });

  const apiKey = process.env.LOVABLE_API_KEY ?? process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return new Response("AI is not configured yet.", { status: 503 });

  const provider = createOpenAICompatible({
    name: "growzzy-gateway",
    baseURL: process.env.LOVABLE_API_KEY ? "https://ai.gateway.lovable.dev/v1" : "https://ai-gateway.vercel.sh/v1",
    apiKey,
    headers: process.env.LOVABLE_API_KEY ? { "Lovable-API-Key": apiKey } : undefined,
  });

  const result = streamText({
    model: provider(process.env.LOVABLE_API_KEY ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash"),
    system: `${SYSTEM}${body.brandContext ? `\nKnown brand context:\n${body.brandContext}` : ""}`,
    messages: await convertToModelMessages(body.messages),
    stopWhen: stepCountIs(5),
    abortSignal: request.signal,
  });

  return result.toUIMessageStreamResponse();
}
