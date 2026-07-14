import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { StatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { endpoints } from "@/lib/api";
import { Zap, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { OptimizationAction } from "@/lib/types";

export const Route = createFileRoute("/_app/optimization")({
  head: () => ({ meta: [{ title: "AI Optimization · Growzzy OS" }] }),
  component: OptimizationPage,
});

function OptimizationPage() {
  const q = useQuery({ queryKey: ["opt"], queryFn: endpoints.optimization.list, retry: false });
  const log = useQuery({ queryKey: ["opt-log"], queryFn: endpoints.optimization.log, retry: false });
  const [autopilot, setAutopilot] = useState<"alert" | "approval" | "full">("alert");
  const [stopLoss, setStopLoss] = useState(true);
  const [maxShift, setMaxShift] = useState([20]);

  return (
    <div>
      <PageHeader title="AI Optimization" subtitle="Growzzy watches your campaigns and suggests what to change." />

      <Tabs defaultValue="recs">
        <TabsList className="mb-4">
          <TabsTrigger value="recs">Recommendations</TabsTrigger>
          <TabsTrigger value="log">Action log</TabsTrigger>
          <TabsTrigger value="autopilot">Autopilot</TabsTrigger>
        </TabsList>

        <TabsContent value="recs">
          {q.isLoading ? (
            <SectionCard><SkeletonPanel rows={4} /></SectionCard>
          ) : (q.data ?? []).length === 0 ? (
            <SectionCard>
              <EmptyState
                icon={<Zap className="h-6 w-6" />}
                title="No recommendations yet"
                description="Once your campaigns have run for a bit, Growzzy will suggest specific optimizations here — with real numbers."
              />
            </SectionCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {q.data!.map((a: OptimizationAction) => (
                <SectionCard key={a.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <StatusPill variant={a.severity === "critical" ? "danger" : a.severity === "medium" ? "warn" : "info"}>
                      {a.severity[0].toUpperCase() + a.severity.slice(1)}
                    </StatusPill>
                  </div>
                  <p className="text-[14px] font-semibold mb-1">{a.finding}</p>
                  <p className="text-[13px] text-muted-foreground mb-3">{a.explanation}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => toast.success("Applied — undo in the toast below", { action: { label: "Undo", onClick: () => toast("Reverted") } })}>Apply</Button>
                    <Button size="sm" variant="outline">Dismiss</Button>
                    <Button size="sm" variant="ghost" className="gap-1"><Clock className="h-3 w-3" />Snooze 7d</Button>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="log">
          <SectionCard padding={false}>
            {log.isLoading ? (
              <div className="p-6"><SkeletonPanel /></div>
            ) : (log.data ?? []).length === 0 ? (
              <EmptyState title="Nothing logged yet" description="Applied optimizations will appear here — you can undo any of them for 30 days." />
            ) : (
              <div className="divide-y divide-border">
                {log.data!.map((a) => (
                  <div key={a.id} className="grid grid-cols-6 gap-4 px-5 py-3 text-[13px] items-center">
                    <div className="text-muted-foreground tnum">{new Date(a.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-2">{a.finding}</div>
                    <div className="text-muted-foreground">{a.target}</div>
                    <div className="text-success">{a.outcome ?? "—"}</div>
                    <div><Button size="sm" variant="ghost">Undo</Button></div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="autopilot">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { key: "alert", title: "Alert only", desc: "Growzzy flags issues. You decide everything.", items: ["Sends recommendations", "Never changes anything on its own"] },
              { key: "approval", title: "Approval required", desc: "Growzzy proposes changes and waits for your OK.", items: ["Suggests budget shifts, pauses", "Applies only after you approve"] },
              { key: "full", title: "Full autopilot", desc: "Growzzy applies safe changes automatically.", items: ["Pauses wasteful ad groups", "Rebalances budgets within guardrails"] },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setAutopilot(m.key as typeof autopilot)}
                className={`card-surface text-left p-5 transition-all ${autopilot === m.key ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{m.title}</h4>
                  {autopilot === m.key && <Check className="h-4 w-4 text-primary" />}
                </div>
                <p className="text-[13px] text-muted-foreground mb-3">{m.desc}</p>
                <ul className="text-[12px] text-muted-foreground space-y-1">
                  {m.items.map((i) => <li key={i}>• {i}</li>)}
                </ul>
              </button>
            ))}
          </div>

          <SectionCard title="Guardrails">
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-medium block mb-2">Max daily budget shift ({maxShift[0]}%)</label>
                <Slider value={maxShift} onValueChange={setMaxShift} max={100} step={5} />
                <p className="text-[12px] text-muted-foreground mt-1">Growzzy can move budget by at most this % per day.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium">Stop-loss</div>
                  <div className="text-[12px] text-muted-foreground">Auto-pause ad groups that spend without any results.</div>
                </div>
                <Switch checked={stopLoss} onCheckedChange={setStopLoss} />
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
// Silence unused
export const _u = X;
