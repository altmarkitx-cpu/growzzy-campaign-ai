import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, tool, generateText, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, generateAdImage, CHAT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM = `You are Growzzy, an autonomous ad-campaign strategist inside the Growzzy OS platform.

Your job: turn a short business request into a complete, launch-ready ad campaign.

CRITICAL — what you already know:
- The user's brand context (business, offer, positioning, competitors, audience, keywords, tone) is supplied to you below when available. NEVER ask what the business is, what they sell, what industry they are in, or anything already in that context. Asking it is a failure.
- If the brand context is missing/empty, do NOT interrogate the user. Call requestBrandSetup once so the app can analyse their website, and stop there.
- Growzzy supports ONLY Google Ads and Meta Ads. Never offer, mention or plan LinkedIn, TikTok, X, Pinterest or any other platform as an option.

Workflow — follow it strictly, one tool at a time:
1. Read the brand context and the request. Decide what is genuinely missing: budget, geography, platform (Google vs Meta only), specific offer/promo, landing page, campaign timing.
2. Call research FIRST when you need market facts — it performs REAL live web search and reads REAL pages. Never claim research you didn't run.
3. Only if something material is still unclear, call askUser ONCE with 2-4 sharp doubts. Every question and every option must be specific to THIS business (use its real products, real competitors, real audience segments from the context/research) — never generic "what do you do" style questions. Give 3-5 concrete options per question plus one recommended. Platform questions may only offer Google Ads and/or Meta Ads.
4. Call proposePlan with a step-by-step execution plan (4-7 steps) and wait for approval. Do not build anything before approval.
5. After approval: call generateCreative once (a vivid, brand-appropriate ad visual prompt), then deliverCampaign with the complete package.
6. Finish with a short markdown summary (tables for ad copy) and 2-3 next steps.

Rules:
- Be concise and concrete. No filler, no restating the brief.
- Frame benchmarks as estimates; cite the sources research returns when useful.
- All money figures use the user's currency if stated, otherwise USD.`;


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
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured yet.", { status: 500 });

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway(CHAT_MODEL);

        const result = streamText({
          model,
          system: SYSTEM,
          messages: await convertToModelMessages(stripCreativeImages(messages)),
          stopWhen: stepCountIs(50),
          tools: {
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
                  apiKey,
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

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
