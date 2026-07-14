import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { StatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { endpoints } from "@/lib/api";
import { Check, Sparkles, X, Rocket, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { CampaignPlan } from "@/lib/types";

export const Route = createFileRoute("/_app/builder/$planId")({
  head: () => ({ meta: [{ title: "Campaign Builder · Growzzy OS" }] }),
  component: BuilderPage,
});

const steps = ["Brief", "Goal & bidding", "Targeting", "Keywords", "Ads", "Budget", "Policy check", "Publish"];

function BuilderPage() {
  const { planId } = useParams({ from: "/_app/builder/$planId" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [current, setCurrent] = useState(1);

  const q = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => endpoints.ai.getPlan(planId),
    retry: false,
  });

  const patch = useMutation({
    mutationFn: (p: Partial<CampaignPlan>) => endpoints.ai.updatePlan(planId, p),
    onSuccess: (data) => qc.setQueryData(["plan", planId], data),
  });

  const launch = useMutation({
    mutationFn: () => endpoints.ai.launch(planId),
    onSuccess: (r) => toast.success(`Launched — Google campaign ${r.googleCampaignId} (starts paused)`, {
      action: { label: "Go to Ads Manager", onClick: () => navigate({ to: "/ads" }) },
    }),
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Couldn't launch — try again."),
  });

  if (q.isLoading) return <SkeletonPanel rows={8} />;
  const plan = q.data;
  const disconnected = q.isError || !plan;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_360px] gap-4">
      {/* LEFT: step rail */}
      <aside>
        <SectionCard title="Campaign flow">
          <p className="text-[12px] text-muted-foreground mb-4">Complete all steps before publish.</p>
          <ol className="relative space-y-1">
            <span className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
            {steps.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={s}>
                  <button
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "relative flex items-center gap-3 w-full text-left rounded-[8px] px-2 py-1.5 transition-colors",
                      active && "bg-primary-tint",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 h-[22px] w-[22px] rounded-full grid place-items-center text-[10px] font-bold",
                        done ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary bg-background" : "border border-border bg-background text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={cn("text-[13px]", active ? "font-semibold text-foreground" : done ? "text-foreground/70" : "text-muted-foreground")}>
                      {s}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </SectionCard>
      </aside>

      {/* MIDDLE: editor */}
      <div className="min-w-0">
        {disconnected ? (
          <SectionCard>
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="Your plan will load here"
              description="Once Growzzy's builder is connected, your generated campaign plan appears here — editable step by step."
              action={<Button onClick={() => navigate({ to: "/" })}>Back to New Campaign</Button>}
            />
          </SectionCard>
        ) : (
          <>
            <PageHeader
              title={plan!.name || "New campaign"}
              subtitle="Every edit auto-saves as you go."
              actions={<StatusPill variant="primary">Score {plan!.score}/100</StatusPill>}
            />

            <Accordion type="single" collapsible defaultValue="goal" className="space-y-3">
              <BuilderSection value="goal" title="Goal & bidding">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Objective</Label>
                    <Select value={plan!.objective} onValueChange={(v) => patch.mutate({ objective: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="traffic">Website traffic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bidding</Label>
                    <Select value={plan!.bidding} onValueChange={(v) => patch.mutate({ bidding: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="max_conversions">Maximize conversions</SelectItem>
                        <SelectItem value="target_cpa">Target CPA</SelectItem>
                        <SelectItem value="target_roas">Target ROAS</SelectItem>
                        <SelectItem value="max_clicks">Maximize clicks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {plan!.biddingRationale && (
                  <div className="mt-4 rounded-[10px] bg-primary-tint p-3 flex gap-2">
                    <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-[13px]">
                      <div className="font-semibold text-primary mb-0.5">Why this bidding</div>
                      <p className="text-foreground/80">{plan!.biddingRationale}</p>
                    </div>
                  </div>
                )}
              </BuilderSection>

              <BuilderSection value="keywords" title="Keywords">
                {plan!.adGroups.map((g) => (
                  <div key={g.id} className="mb-4">
                    <div className="text-[13px] font-semibold mb-2">{g.name}</div>
                    <KeywordEditor keywords={g.keywords} />
                    <div className="mt-2 text-[12px] font-medium text-muted-foreground">Negatives</div>
                    <KeywordEditor keywords={g.negatives} negative />
                  </div>
                ))}
              </BuilderSection>

              <BuilderSection value="ads" title="Ads">
                {plan!.adGroups.map((g) => (
                  <div key={g.id} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[13px] font-semibold">{g.name}</div>
                      <Button size="sm" variant="outline" className="gap-1"><Sparkles className="h-3 w-3" />Regenerate copy</Button>
                    </div>
                    {g.ads[0]?.headlines.map((h, i) => <CharInput key={i} label={`Headline ${i + 1}`} max={30} initial={h} />)}
                    {g.ads[0]?.descriptions.map((d, i) => <CharInput key={i} label={`Description ${i + 1}`} max={90} initial={d} textarea />)}
                  </div>
                ))}
              </BuilderSection>

              <BuilderSection value="budget" title="Budget">
                <Label>Daily budget ($)</Label>
                <Input
                  type="number"
                  value={plan!.budgetDaily}
                  onChange={(e) => patch.mutate({ budgetDaily: Number(e.target.value) })}
                  className="mt-1 w-40"
                />
                {plan!.expectedResults && (
                  <p className="text-[13px] text-muted-foreground mt-3">Expected: {plan!.expectedResults}</p>
                )}
              </BuilderSection>

              <BuilderSection value="policy" title="Policy check">
                <PolicyRunner planId={planId} />
              </BuilderSection>
            </Accordion>

            <div className="mt-6 card-surface p-4 flex items-center justify-between sticky bottom-4">
              <div>
                <div className="text-[13px] font-semibold">Ready to launch</div>
                <p className="text-[12px] text-muted-foreground">Growzzy launches your campaign paused so you can review inside Google Ads first.</p>
              </div>
              <Button className="gap-1.5" onClick={() => launch.mutate()} disabled={launch.isPending}>
                <Rocket className="h-4 w-4" />
                {launch.isPending ? "Launching…" : "Launch (starts paused)"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: live preview */}
      <aside>
        <SectionCard title="Live preview">
          <div className="rounded-[10px] border border-border p-3 bg-background">
            <div className="text-[11px] text-muted-foreground mb-1">Sponsored</div>
            <div className="text-[12px] text-foreground/70 mb-0.5">{plan?.landingPage ?? "yourbrand.com"}</div>
            <div className="text-[16px] text-primary font-medium leading-tight mb-1">
              {plan?.adGroups?.[0]?.ads?.[0]?.headlines?.[0] ?? "Your headline appears here"}
            </div>
            <div className="text-[12px] text-foreground/80">
              {plan?.adGroups?.[0]?.ads?.[0]?.descriptions?.[0] ?? "Your description appears here — up to 90 characters, telling searchers exactly why to click."}
            </div>
          </div>
          <div className="mt-4 space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="tnum font-medium">${plan?.budgetDaily ?? 0}/day</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">State</span><StatusPill variant="draft">Draft</StatusPill></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Policy</span><StatusPill variant={plan?.policy?.state === "pass" ? "success" : plan?.policy?.state === "warn" ? "warn" : "info"}>{plan?.policy?.state ?? "Not checked"}</StatusPill></div>
          </div>
        </SectionCard>
      </aside>
    </div>
  );
}

function BuilderSection({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className="card-surface border-0 px-5">
      <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pt-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function KeywordEditor({ keywords, negative }: { keywords: { text: string; match: string }[]; negative?: boolean }) {
  const [items, setItems] = useState(keywords);
  const [txt, setTxt] = useState("");
  useEffect(() => setItems(keywords), [keywords]);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((k, i) => (
          <span key={i} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px]", negative ? "bg-danger-bg text-danger" : "bg-primary-tint text-primary")}>
            {k.text}
            <span className="text-[10px] opacity-70">·{k.match}</span>
            <button onClick={() => setItems(items.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <Input
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && txt.trim()) {
            e.preventDefault();
            setItems([...items, { text: txt.trim(), match: "broad" }]);
            setTxt("");
          }
        }}
        placeholder="Type and press Enter"
        className="max-w-md"
      />
    </div>
  );
}

function CharInput({ label, max, initial, textarea }: { label: string; max: number; initial: string; textarea?: boolean }) {
  const [v, setV] = useState(initial ?? "");
  const over = v.length >= max;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <Label className="text-[12px]">{label}</Label>
        <span className={cn("text-[11px] tnum", over ? "text-danger font-semibold" : "text-muted-foreground")}>{v.length}/{max}</span>
      </div>
      {textarea ? (
        <Textarea rows={2} value={v} onChange={(e) => setV(e.target.value.slice(0, max))} />
      ) : (
        <Input value={v} onChange={(e) => setV(e.target.value.slice(0, max))} />
      )}
    </div>
  );
}

function PolicyRunner({ planId }: { planId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "pass" | "warn" | "fail">("idle");
  const run = async () => {
    setState("loading");
    try {
      const r = await endpoints.ai.policyCheck(planId);
      setState(r.state);
    } catch {
      setState("idle");
      toast.error("Couldn't reach the policy checker — try again.");
    }
  };
  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={run} className="gap-1.5"><Shield className="h-4 w-4" />Run policy check</Button>
        {state === "loading" && <span className="text-[13px] text-muted-foreground">Checking…</span>}
        {state === "pass" && <StatusPill variant="success">All clear</StatusPill>}
        {state === "warn" && <StatusPill variant="warn">Needs a look</StatusPill>}
        {state === "fail" && <StatusPill variant="danger">Blocked</StatusPill>}
      </div>
      <p className="text-[12px] text-muted-foreground mt-2">Growzzy checks your ad copy against Google's policies before you publish.</p>
    </div>
  );
}
