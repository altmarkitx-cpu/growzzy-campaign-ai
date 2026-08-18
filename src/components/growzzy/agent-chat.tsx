import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  getToolName,
  isToolUIPart,
  type ToolUIPart,
  type UIMessage,
} from "ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { StatusPill } from "@/components/growzzy/status-pill";
import { useBrand, getBrand, brandToPromptContext, hasBrandContext } from "@/lib/brand-store";
import logoAsset from "@/assets/growzzy-logo.png.asset.json";
import {
  ArrowUp,
  Check,
  CircleDot,
  Globe,
  Image as ImageIcon,
  ListChecks,
  Megaphone,
  MessageCircleQuestion,
  Rocket,
  Search,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

/* ------------------------------- tool payloads ------------------------------ */

type AskUserInput = {
  questions: {
    id: string;
    question: string;
    why: string;
    options: { label: string; description: string; recommended: boolean }[];
  }[];
};

type PlanInput = {
  title: string;
  summary: string;
  steps: { title: string; detail: string }[];
};

type CreativeOutput = { caption: string; imageUrl: string | null; error?: string };

type CampaignInput = {
  name: string;
  platform: string;
  objective: string;
  budgetDaily: number;
  currency: string;
  bidding: string;
  schedule: string;
  landingPage: string;
  targeting: { setting: string; value: string }[];
  keywords: string[];
  headlines: string[];
  descriptions: string[];
  primaryText: string;
  cta: string;
  kpis: { metric: string; target: string }[];
  risks: string[];
};

const suggestions = [
  {
    icon: Target,
    title: "Launch a lead-gen campaign",
    text: "Get demo bookings for my B2B SaaS in the US, budget $80/day",
  },
  {
    icon: Megaphone,
    title: "Sell a product",
    text: "Sell handmade silver jewellery to women 25–45 in India, ₹1,500/day",
  },
  {
    icon: Wand2,
    title: "Creative + copy pack",
    text: "Build a full creative and copy pack for my fitness app launch",
  },
  {
    icon: Rocket,
    title: "Scale what works",
    text: "My CPA is rising on search — rebuild the campaign around high-intent keywords",
  },
];

/** Suggestions tailored to the saved brand so they feel specific, not generic. */
function brandSuggestions(brand: ReturnType<typeof getBrand>) {
  const name = brand.businessName?.trim() || "my business";
  const cur = brand.currency || "USD";
  const budget = cur === "INR" ? "₹2,000/day" : cur === "EUR" ? "€60/day" : "$60/day";
  const list: { icon: typeof Target; title: string; text: string }[] = [];

  if (brand.website?.trim()) {
    list.push({
      icon: Globe,
      title: "Analyze my website",
      text: `Deeply analyze ${brand.website.trim()} and build a Google Ads campaign around what you find`,
    });
  }
  list.push({
    icon: Target,
    title: brand.primaryGoal === "leads" ? "Get more leads" : "Launch a campaign",
    text: `Launch a Google Ads campaign for ${name} to drive ${
      brand.primaryGoal === "leads" ? "qualified leads" : brand.primaryGoal === "traffic" ? "website traffic" : "sales"
    }, budget ${budget}`,
  });
  list.push({
    icon: Wand2,
    title: "Creative + copy pack",
    text: `Write a full ad creative and copy pack for ${name} in our brand voice`,
  });
  list.push({
    icon: Rocket,
    title: "Scale what works",
    text: `My CPA is rising — rebuild ${name}'s campaign around high-intent keywords`,
  });
  return list.slice(0, 4);
}

export interface AgentChatProps {
  threadId?: string;
  greetingName?: string;
}

export function AgentChat({ threadId = "growzzy-agent", greetingName = "there" }: AgentChatProps) {
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const lastPromptRef = useRef("");
  const brand = useBrand();
  const brandReady = hasBrandContext(brand);

  useEffect(() => {
    const saved = window.localStorage.getItem(`growzzy-draft-${threadId}`);
    if (saved) setDraft(saved);
  }, [threadId]);

  useEffect(() => {
    if (draft) window.localStorage.setItem(`growzzy-draft-${threadId}`, draft);
    else window.localStorage.removeItem(`growzzy-draft-${threadId}`);
  }, [draft, threadId]);

  const { messages, sendMessage, addToolResult, status, stop, regenerate, error, clearError } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Inject the latest saved brand profile with every request so the agent
      // already knows the business instead of asking for it.
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: { ...body, messages, brandContext: brandToPromptContext(getBrand()) },
      }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (e) => {
      setInput(lastPromptRef.current);
      setDraft(lastPromptRef.current);
      toast.error(e.message || "Growzzy couldn't answer — your draft is preserved.");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const started = messages.length > 0;

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    lastPromptRef.current = value;
    setDraft(value);
    setInput("");
    clearError();
    void sendMessage({ text: value });
  };

  const retry = () => {
    clearError();
    if (messages.length > 0) void regenerate();
    else if (lastPromptRef.current) submit(lastPromptRef.current);
  };

  const downloadTranscript = () => {
    const lines = messages.map((message) => {
      const time = new Date().toLocaleString();
      const body = message.parts
        .map((part) => {
          if (part.type === "text") return part.text;
          if (isToolUIPart(part)) {
            const name = getToolName(part as ToolUIPart);
            return `[${name}]\\n${JSON.stringify({ input: part.input, output: part.output }, null, 2)}`;
          }
          return "";
        })
        .filter(Boolean)
        .join("\\n");
      return `${time} — ${message.role.toUpperCase()}\\n${body}`;
    });
    const blob = new Blob([lines.join("\\n\\n---\\n\\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `growzzy-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-116px)] flex-col">
      {started ? (
        <Conversation className="flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl px-1 pb-6">
            {messages.map((m) => (
              <AgentMessage key={m.id} message={m} addToolResult={addToolResult} />
            ))}
            {status === "submitted" && (
              <div className="flex items-center gap-2 pl-1">
                <Shimmer className="text-[13.5px]">Growzzy is thinking…</Shimmer>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <img src={logoAsset.url} alt="Growzzy" className="mb-5 h-11 w-11 rounded-xl" />
          <h1 className="text-[34px] font-semibold tracking-tight text-foreground">
            Hello, {greetingName}
          </h1>
          {brandReady ? (
            <>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-tint px-3 py-1 text-[12px] font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                Building for {brand.businessName || "your brand"}
              </span>
              <p className="mt-3 max-w-md text-center text-[14px] text-muted-foreground">
                I already know your brand from <span className="font-medium text-foreground">My Brand</span>.
                Just tell me the goal, budget or offer — I'll research, plan and deliver a launch-ready
                campaign, creative included.
              </p>
            </>
          ) : (
            <p className="mt-2 max-w-md text-center text-[14px] text-muted-foreground">
              Tell me what you want to advertise. I'll research it, ask what I'm unsure about, plan the
              build, then hand you a launch-ready campaign — creative included.{" "}
              <a href="/brand" className="font-medium text-primary hover:underline">
                Set up My Brand
              </a>{" "}
              so I never have to ask what you sell.
            </p>
          )}
          <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-2">
            {(brandReady ? brandSuggestions(brand) : suggestions).map((s) => (
              <button
                key={s.title}
                onClick={() => submit(s.text)}
                className="group flex items-start gap-3 rounded-[12px] border border-border bg-card p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-primary-tint/40"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-tint text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-foreground">{s.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                    {s.text}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {started && (
        <div className="mx-auto mb-2 flex w-full max-w-3xl items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            {error && <Button size="sm" variant="outline" onClick={retry}>Retry with my draft</Button>}
            {error && <span className="text-xs text-destructive">Your last message is preserved.</span>}
          </div>
          <Button size="sm" variant="ghost" onClick={downloadTranscript}>Download transcript</Button>
        </div>
      )}

      {/* Composer */}
      <div className="mx-auto w-full max-w-3xl px-1 pb-2">
        <PromptInput
          className="rounded-2xl bg-card shadow-sm"
          onSubmit={(_msg, e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            autoFocus
            placeholder={
              started
                ? "Reply, refine the plan, or ask for changes…"
                : "Describe your product, offer or goal…"
            }
          />
          <PromptInputFooter className="justify-between">
            <PromptInputTools>
              <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px] text-muted-foreground" aria-label="Research mode">
                <CircleDot className="h-3 w-3 text-primary" />
                Standard
              </button>
            </PromptInputTools>
            {busy && (
              <Button type="button" size="icon" variant="outline" aria-label="Cancel generation" onClick={() => stop()} className="rounded-full">
                <span className="size-2.5 rounded-sm bg-current" />
              </Button>
            )}
            {!busy && (
              <Button type="submit" size="icon" aria-label="Send message" disabled={!input.trim()} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                <ArrowUp className="size-4" />
              </Button>
            )}
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Growzzy can make mistakes. Review every campaign before launching.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- message ---------------------------------- */

type AddToolResult = ReturnType<typeof useChat>["addToolResult"];

function AgentMessage({
  message,
  addToolResult,
}: {
  message: UIMessage;
  addToolResult: AddToolResult;
}) {
  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageContent>
          {message.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from="assistant" className="[&>div]:max-w-full">
      <MessageContent className="w-full bg-transparent p-0 text-foreground">
        <div className="space-y-4">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return part.text ? <MessageResponse key={i}>{part.text}</MessageResponse> : null;
            }
            if (!isToolUIPart(part)) return null;
            const name = getToolName(part as ToolUIPart);

            if (name === "proposePlan") {
              return (
                <PlanCard key={i} part={part as ToolUIPart} addToolResult={addToolResult} />
              );
            }
            if (name === "analyzeWebsite") {
              return <AnalyzeSiteCard key={i} part={part as ToolUIPart} />;
            }
            if (name === "generateCreative") {
              return <CreativeCard key={i} part={part as ToolUIPart} />;
            }
            if (name === "deliverCampaign") {
              return <CampaignCard key={i} part={part as ToolUIPart} />;
            }
            // research + anything else
            return <ResearchCard key={i} part={part as ToolUIPart} />;
          })}
        </div>
      </MessageContent>
    </Message>
  );
}

/* ------------------------------- tool cards -------------------------------- */

function AnalyzeSiteCard({ part }: { part: ToolUIPart }) {
  const input = part.input as { url?: string } | undefined;
  const output = part.output as
    | { ok?: boolean; title?: string; analysis?: string; error?: string }
    | undefined;
  const running = part.state !== "output-available" && part.state !== "output-error";
  const failed = output?.ok === false;

  return (
    <div className="rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
          <Globe className="h-3.5 w-3.5" />
        </span>
        {running ? (
          <Shimmer className="text-[13px] font-medium">{`Reading ${input?.url ?? "your website"}…`}</Shimmer>
        ) : failed ? (
          <span className="text-[13px] font-medium text-foreground">Couldn't analyze the site</span>
        ) : (
          <span className="text-[13px] font-medium text-foreground">
            Analyzed {output?.title || input?.url || "your website"}
          </span>
        )}
      </div>
      {input?.url && (
        <div className="mt-2 truncate text-[11.5px] text-muted-foreground">{input.url}</div>
      )}
      {failed && output?.error && (
        <p className="mt-2 text-[12.5px] text-destructive">{output.error}</p>
      )}
      {!failed && output?.analysis && (
        <Tool defaultOpen className="mt-3 border-0 bg-transparent">
          <ToolHeader type={`tool-${getToolName(part)}` as ToolUIPart["type"]} state={part.state} />
          <ToolContent>
            <div className="px-4 pb-3 text-[12.5px]">
              <MessageResponse>{output.analysis}</MessageResponse>
            </div>
          </ToolContent>
        </Tool>
      )}
    </div>
  );
}

function ResearchCard({ part }: { part: ToolUIPart }) {
  const input = part.input as { focus?: string; topics?: string[] } | undefined;
  const output = part.output as { notes?: string } | undefined;
  const running = part.state !== "output-available" && part.state !== "output-error";

  return (
    <div className="rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
          <Search className="h-3.5 w-3.5" />
        </span>
        {running ? (
          <Shimmer className="text-[13px] font-medium">{`Researching ${input?.focus ?? "your market"}…`}</Shimmer>
        ) : (
          <span className="text-[13px] font-medium text-foreground">
            Research complete — {input?.focus ?? "market analysis"}
          </span>
        )}
      </div>
      {input?.topics && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {input.topics.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11.5px] text-muted-foreground"
            >
              {!running && <Check className="h-3 w-3 text-success" />}
              {t}
            </span>
          ))}
        </div>
      )}
      {output?.notes && (
        <Tool defaultOpen={false} className="mt-3 border-0 bg-transparent">
          <ToolHeader type={`tool-${getToolName(part)}` as ToolUIPart["type"]} state={part.state} />
          <ToolContent>
            <div className="px-4 pb-3 text-[12.5px]">
              <MessageResponse>{output.notes}</MessageResponse>
            </div>
          </ToolContent>
        </Tool>
      )}
    </div>
  );
}

function QuestionsCard({
  part,
  addToolResult,
}: {
  part: ToolUIPart;
  addToolResult: AddToolResult;
}) {
  const input = part.input as AskUserInput | undefined;
  const answered = part.state === "output-available";
  const submitted = (part.output as { answers?: Record<string, string> } | undefined)?.answers;
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!input?.questions?.length) return null;
  const total = input.questions.length;
  const complete = input.questions.every((q) => answers[q.id]);

  return (
    <div className="rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
          <MessageCircleQuestion className="h-3.5 w-3.5" />
        </span>
        <span className="text-[13px] font-medium text-foreground">
          A few things before I build
        </span>
        <StatusPill variant="primary">{total} questions</StatusPill>
      </div>

      <div className="mt-4 space-y-4">
        {input.questions.map((q, qi) => (
          <div key={q.id} className="rounded-[10px] border border-border bg-background p-3.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {qi + 1} / {total}
            </div>
            <div className="mt-1 text-[13.5px] font-medium text-foreground">{q.question}</div>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{q.why}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => {
                const selected = (submitted?.[q.id] ?? answers[q.id]) === o.label;
                return (
                  <button
                    key={o.label}
                    disabled={answered}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.label }))}
                    className={cn(
                      "rounded-[10px] border p-2.5 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary-tint"
                        : "border-border bg-card hover:border-primary/30",
                      answered && !selected && "opacity-60",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-medium text-foreground">{o.label}</span>
                      {o.recommended && (
                        <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                      {o.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!answered && (
        <Button
          className="mt-4 w-full"
          disabled={!complete}
          onClick={() =>
            addToolResult({
              tool: "askUser",
              toolCallId: part.toolCallId,
              output: { answers },
            })
          }
        >
          Send answers
        </Button>
      )}
      {answered && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-success">
          <Check className="h-3.5 w-3.5" /> Answers sent
        </div>
      )}
    </div>
  );
}

function PlanCard({ part, addToolResult }: { part: ToolUIPart; addToolResult: AddToolResult }) {
  const input = part.input as PlanInput | undefined;
  const output = part.output as { approved?: boolean } | undefined;
  if (!input?.steps?.length) return null;
  const decided = part.state === "output-available";

  return (
    <div className="rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
          <ListChecks className="h-3.5 w-3.5" />
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {input.title || "Execution plan"}
        </span>
        {decided && (
          <StatusPill variant={output?.approved ? "success" : "warn"}>
            {output?.approved ? "Approved" : "Changes requested"}
          </StatusPill>
        )}
      </div>
      {input.summary && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{input.summary}</p>
      )}
      <ol className="mt-4 space-y-3">
        {input.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-medium",
                decided && output?.approved
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {decided && output?.approved ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span>
              <span className="block text-[13px] font-medium text-foreground">{s.title}</span>
              <span className="block text-[12px] leading-snug text-muted-foreground">
                {s.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {!decided && (
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1 gap-1.5"
            onClick={() =>
              addToolResult({
                tool: "proposePlan",
                toolCallId: part.toolCallId,
                output: { approved: true },
              })
            }
          >
            <Rocket className="h-4 w-4" /> Proceed with plan
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              addToolResult({
                tool: "proposePlan",
                toolCallId: part.toolCallId,
                output: {
                  approved: false,
                  feedback: "The user wants changes — ask what to adjust before building.",
                },
              })
            }
          >
            Request changes
          </Button>
        </div>
      )}
    </div>
  );
}

function CreativeCard({ part }: { part: ToolUIPart }) {
  const input = part.input as { caption?: string; prompt?: string } | undefined;
  const output = part.output as CreativeOutput | undefined;
  const running = part.state !== "output-available" && part.state !== "output-error";

  return (
    <div className="rounded-[12px] border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
          <ImageIcon className="h-3.5 w-3.5" />
        </span>
        {running ? (
          <Shimmer className="text-[13px] font-medium">Generating your ad creative…</Shimmer>
        ) : (
          <span className="text-[13px] font-medium text-foreground">
            {output?.caption ?? input?.caption ?? "Ad creative"}
          </span>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-[10px] border border-border bg-muted">
        {output?.imageUrl ? (
          <img
            src={output.imageUrl}
            alt={output.caption ?? "Generated ad creative"}
            className="aspect-square w-full max-w-sm object-cover"
          />
        ) : (
          <div className="grid aspect-square w-full max-w-sm place-items-center text-[12px] text-muted-foreground">
            {output?.error ?? "Rendering…"}
          </div>
        )}
      </div>
      {input?.prompt && (
        <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">{input.prompt}</p>
      )}
    </div>
  );
}

function CampaignCard({ part }: { part: ToolUIPart }) {
  const c = part.input as CampaignInput | undefined;
  if (!c?.name) return null;
  return (
    <div className="rounded-[12px] border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary-tint text-primary">
            <Megaphone className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-[13.5px] font-semibold text-foreground">{c.name}</div>
            <div className="text-[11.5px] text-muted-foreground">
              {c.platform} · {c.objective}
            </div>
          </div>
        </div>
        <StatusPill variant="success">Launch ready</StatusPill>
      </header>

      <div className="grid gap-x-6 gap-y-2 px-4 py-3 sm:grid-cols-2">
        <Field label="Daily budget" value={`${c.currency} ${c.budgetDaily}`} />
        <Field label="Bidding" value={c.bidding} />
        <Field label="Schedule" value={c.schedule} />
        <Field label="Landing page" value={c.landingPage} />
      </div>

      {c.targeting?.length > 0 && (
        <Block title="Targeting">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {c.targeting.map((t) => (
              <Field key={t.setting} label={t.setting} value={t.value} />
            ))}
          </div>
        </Block>
      )}

      {c.keywords?.length > 0 && (
        <Block title="Keywords">
          <div className="flex flex-wrap gap-1.5">
            {c.keywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-[11.5px] text-primary"
              >
                <Search className="h-3 w-3" />
                {k}
              </span>
            ))}
          </div>
        </Block>
      )}

      <Block title="Ad copy">
        <div className="space-y-1.5">
          {c.headlines?.map((h) => (
            <div key={h} className="text-[13px] font-medium text-primary">
              {h}
            </div>
          ))}
          {c.descriptions?.map((d) => (
            <div key={d} className="text-[12.5px] text-foreground/80">
              {d}
            </div>
          ))}
          {c.primaryText && (
            <p className="pt-1 text-[12.5px] leading-relaxed text-muted-foreground">
              {c.primaryText}
            </p>
          )}
          {c.cta && (
            <div className="pt-1">
              <span className="rounded-md bg-primary px-2.5 py-1 text-[11.5px] font-medium text-primary-foreground">
                {c.cta}
              </span>
            </div>
          )}
        </div>
      </Block>

      {c.kpis?.length > 0 && (
        <Block title="Targets">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {c.kpis.map((k) => (
              <Field key={k.metric} label={k.metric} value={k.target} />
            ))}
          </div>
        </Block>
      )}

      {c.risks?.length > 0 && (
        <Block title="Watch-outs">
          <ul className="space-y-1">
            {c.risks.map((r) => (
              <li key={r} className="text-[12.5px] text-muted-foreground">
                • {r}
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-4 py-3">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
      <span className="text-[12.5px] font-medium text-foreground">{value}</span>
    </div>
  );
}

/* keeps ToolInput/ToolOutput imported for future tool surfaces */
export { ToolInput, ToolOutput };
