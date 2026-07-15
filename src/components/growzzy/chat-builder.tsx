import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/growzzy/status-pill";
import { ArrowUp, Sparkles, Rocket, Target, Users, DollarSign, MapPin, Search, Megaphone, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CampaignPlan } from "@/lib/types";

type Role = "user" | "assistant";
type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  chips?: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[];
  pending?: boolean;
};

const suggestionChips = [
  "Sell handmade jewellery to women 25–45 in India",
  "Get demo bookings for my B2B SaaS in the US",
  "Drive app installs for my fitness app, budget $50/day",
];

export interface ChatBuilderProps {
  initialPrompt?: string;
  plan?: CampaignPlan | null;
  onLaunch?: () => void;
  launching?: boolean;
  onSend?: (text: string) => Promise<void> | void;
}

export function ChatBuilder({ initialPrompt = "", plan, onLaunch, launching, onSend }: ChatBuilderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);

    try {
      await onSend?.(text);
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Couldn't reach Growzzy — try again.");
    }

    // Simulated assistant follow-up so the UI feels live even without a backend.
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          messages.length === 0
            ? "Got it. I've drafted a campaign on the right — targeting, keywords, ad copy and daily budget. Anything you want me to adjust before we launch?"
            : "Updated. Take a look at the plan on the right — tell me if it feels right or share what to change.",
        chips: [
          { icon: Target, label: "Objective", value: plan?.objective ?? "Sales" },
          { icon: Users, label: "Audience", value: "Set" },
          { icon: MapPin, label: "Location", value: "Set" },
          { icon: DollarSign, label: "Budget", value: `$${plan?.budgetDaily ?? 30}/day` },
        ],
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-4 h-[calc(100vh-120px)]">
      {/* LEFT: Chat */}
      <div className="flex flex-col card-surface overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {!started ? (
            <div className="max-w-2xl mx-auto text-center pt-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary mb-5">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
                What are we running today?
              </h1>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Describe your product, offer or goal. Growzzy will draft the whole campaign — you just review.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {suggestionChips.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left rounded-full border border-border bg-background px-3 py-1.5 text-[12.5px] text-foreground/80 hover:border-primary/30 hover:bg-primary-tint hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5">
              {messages.map((m) => (
                <Message key={m.id} msg={m} />
              ))}
              {thinking && (
                <div className="flex items-start gap-3">
                  <Avatar />
                  <div className="rounded-2xl bg-muted/50 px-4 py-3 text-[13.5px] text-muted-foreground inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Growzzy is drafting your plan…
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/60 p-3">
          <div className="max-w-2xl mx-auto">
            <div className="card-surface ring-1 ring-primary/10 shadow-sm p-2 flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder={started ? "Ask Growzzy to tweak anything — audience, budget, tone…" : "Tell Growzzy what you'd like to promote…"}
                className="border-0 shadow-none focus-visible:ring-0 text-[14px] resize-none p-2 min-h-[52px]"
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => send()} disabled={!input.trim()}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              AI can make mistakes. Review before launching.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Live plan */}
      <aside className="flex flex-col card-surface overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-semibold">Campaign plan</h3>
          </div>
          {plan && <StatusPill variant="primary">Score {plan.score}/100</StatusPill>}
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!plan && !started && <PlanSkeleton empty />}
          {!plan && started && <PlanSkeleton />}
          {plan && (
            <>
              <PlanField icon={Target} label="Objective" value={cap(plan.objective)} />
              <PlanField icon={Users} label="Audience" value={plan.adGroups[0]?.name ?? "Primary audience"} />
              <PlanField icon={DollarSign} label="Daily budget" value={`$${plan.budgetDaily}`} />
              <PlanField icon={Sparkles} label="Bidding" value={plan.bidding.replace(/_/g, " ")} />

              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {(plan.adGroups[0]?.keywords ?? []).slice(0, 8).map((k, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary-tint text-primary px-2 py-0.5 text-[11.5px]">
                      <Search className="h-3 w-3" />
                      {k.text}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">Ad preview</div>
                <div className="rounded-[10px] border border-border p-3 bg-background">
                  <div className="text-[11px] text-muted-foreground mb-1">Sponsored · {plan.landingPage ?? "yourbrand.com"}</div>
                  <div className="text-[16px] text-primary font-medium leading-tight mb-1">
                    {plan.adGroups[0]?.ads[0]?.headlines[0] ?? "Your headline"}
                  </div>
                  <div className="text-[12px] text-foreground/80">
                    {plan.adGroups[0]?.ads[0]?.descriptions[0] ?? "Your description appears here."}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {onLaunch && (
          <div className="border-t border-border p-3">
            <Button className="w-full gap-1.5" onClick={onLaunch} disabled={!plan || launching}>
              <Rocket className="h-4 w-4" />
              {launching ? "Launching…" : "Launch (starts paused)"}
            </Button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Message({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-2.5 text-[13.5px] leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <Avatar />
      <div className="max-w-[85%]">
        <div className="text-[13.5px] leading-relaxed text-foreground">{msg.content}</div>
        {msg.chips && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {msg.chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] text-foreground/80">
                <c.icon className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">{c.label}:</span>
                <span className="font-medium">{c.value}</span>
                <Check className="h-3 w-3 text-success" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div className="h-7 w-7 shrink-0 rounded-lg bg-primary-tint text-primary grid place-items-center">
      <Sparkles className="h-3.5 w-3.5" />
    </div>
  );
}

function PlanField({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-[13px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function PlanSkeleton({ empty }: { empty?: boolean }) {
  if (empty) {
    return (
      <div className="h-full grid place-items-center text-center py-16">
        <div>
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-muted grid place-items-center">
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-[13px] font-medium text-foreground">Your plan appears here</div>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[240px]">
            Start the chat and Growzzy will build your campaign live on this side.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      ))}
      <div className="h-24 rounded-[10px] bg-muted mt-4" />
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
