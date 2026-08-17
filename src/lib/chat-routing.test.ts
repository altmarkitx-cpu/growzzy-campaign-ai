import { describe, expect, it } from "vitest";
import { classifyChatError, resolveSubmission } from "./chat-routing";
import { buildTranscript } from "./transcript";

describe("resolveSubmission — user messages always reach the AI", () => {
  it("sends a plain message to the model", () => {
    expect(resolveSubmission({ text: "how do I scale my ads?", busy: false })).toEqual({
      kind: "send",
      text: "how do I scale my ads?",
    });
  });

  it("never turns a question into a template flow when no tool is pending", () => {
    const cases = [
      "what's a good CPA for SaaS?",
      "budget is $50/day in India",
      "launch a campaign for my new pricing page",
    ];
    for (const text of cases) {
      const r = resolveSubmission({ text, busy: false, pending: null });
      expect(r.kind).toBe("send");
    }
  });

  it("routes typed text as a freeform answer only while an askUser card is unanswered", () => {
    const r = resolveSubmission({
      text: "Mumbai, ₹2000/day",
      busy: false,
      pending: { toolName: "askUser", toolCallId: "call_1", state: "input-available" },
    });
    expect(r).toEqual({ kind: "answer-question", toolCallId: "call_1", freeform: "Mumbai, ₹2000/day" });
  });

  it("sends normally once the askUser card has been answered", () => {
    const r = resolveSubmission({
      text: "ok go ahead",
      busy: false,
      pending: { toolName: "askUser", toolCallId: "call_1", state: "output-available" },
    });
    expect(r.kind).toBe("send");
  });

  it("ignores other pending tools such as the plan gate", () => {
    const r = resolveSubmission({
      text: "change the budget",
      busy: false,
      pending: { toolName: "proposePlan", toolCallId: "call_2", state: "input-available" },
    });
    expect(r.kind).toBe("send");
  });

  it("appends a deep-research hint without altering routing", () => {
    const r = resolveSubmission({ text: "competitor angles", busy: false, mode: "deep" });
    expect(r.kind).toBe("send");
    expect(r.kind === "send" && r.text).toContain("deep live research");
  });

  it("ignores empty input and input while streaming", () => {
    expect(resolveSubmission({ text: "  ", busy: false }).kind).toBe("ignore");
    expect(resolveSubmission({ text: "hi", busy: true }).kind).toBe("ignore");
  });
});

describe("classifyChatError", () => {
  it("detects credit exhaustion", () => {
    expect(classifyChatError(new Error("AI gateway error 402: out of credits")).kind).toBe(
      "credits",
    );
  });
  it("detects blocked workspaces and rate limits", () => {
    expect(classifyChatError(new Error("403 Forbidden")).kind).toBe("blocked");
    expect(classifyChatError(new Error("429 too many requests")).kind).toBe("rate-limit");
  });
});

describe("buildTranscript", () => {
  it("includes questions, research, plan approval and the creative", () => {
    const md = buildTranscript(
      [
        { role: "user", parts: [{ type: "text", text: "launch a lead-gen campaign" }] },
        {
          role: "assistant",
          parts: [
            {
              type: "tool-askUser",
              input: { questions: [{ question: "Which geography?", why: "targeting" }] },
              output: { answers: {}, freeform: "India, ₹2000/day" },
            },
            {
              type: "tool-research",
              input: { focus: "SaaS CPC in India" },
              output: { queries: ["saas cpc india"], notes: "CPC ₹30-60", sources: ["https://x.com"] },
            },
            {
              type: "tool-proposePlan",
              input: { title: "Google Search launch", steps: [{ title: "Keywords", detail: "20 terms" }] },
              output: { approved: true },
            },
            {
              type: "tool-generateCreative",
              input: { caption: "Hero", prompt: "clean product shot" },
              output: { caption: "Hero", imageUrl: "data:image/png;base64,AAA" },
            },
          ],
        },
      ],
      { date: new Date("2026-01-01T00:00:00Z") },
    );

    expect(md).toContain("Which geography?");
    expect(md).toContain("India, ₹2000/day");
    expect(md).toContain("saas cpc india");
    expect(md).toContain("https://x.com");
    expect(md).toContain("APPROVED by user");
    expect(md).toContain("image generated");
  });
});
