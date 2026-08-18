import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getChatModel, isAiConfigured } from "@/lib/ai-gateway.server";

const system = `You are Growzzy, an autonomous ad-campaign strategist. Use the supplied BRAND CONTEXT as the source of truth and never ask the user to restate their business when it is present. Default to Google Ads. Be concise, concrete, and practical. Turn requests into campaign plans, copy, keywords, audiences, budgets, and next steps.`;

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: UIMessage[]; brandContext?: string | null };
  if (!Array.isArray(body.messages)) return new Response("Messages are required", { status: 400 });
  if (!isAiConfigured()) return new Response("AI is not configured yet.", { status: 500 });
  const result = streamText({ model: getChatModel(), system: `${system}\n\nBRAND CONTEXT:\n${body.brandContext || "None saved yet."}`, messages: await convertToModelMessages(body.messages) });
  return result.toUIMessageStreamResponse({ originalMessages: body.messages, onError: () => "AI Gateway needs billing enabled or a configured provider." });
}
