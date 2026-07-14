import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { KpiCard } from "@/components/growzzy/kpi-card";
import { CampaignStatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoints } from "@/lib/api";
import { DollarSign, Target, TrendingUp, Zap, Download, PlugZap, AlertTriangle, Check, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Growzzy OS" }] }),
  component: DashboardPage,
});

const currency = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function DashboardPage() {
  const [range, setRange] = useState("30d");
  const [chartMode, setChartMode] = useState("daily");
  const q = useQuery({
    queryKey: ["dashboard", range],
    queryFn: () => endpoints.dashboard.summary(range),
    retry: false,
  });

  const isDisconnected = q.isError;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Everything Growzzy is doing across your ad accounts."
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
          </>
        }
      />

      {isDisconnected ? (
        <SectionCard>
          <EmptyState
            icon={<PlugZap className="h-6 w-6" />}
            title="Connect Google Ads to see your dashboard"
            description="Once connected, Growzzy pulls live spend, results and ROAS so this page comes to life."
            action={<Button>Connect Google Ads</Button>}
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {q.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-surface p-5"><SkeletonPanel rows={3} /></div>
              ))
            ) : (
              <>
                <KpiCard label="Spend (7d)" value={currency(q.data?.kpi.spend ?? 0)} trend={q.data?.kpi.spendTrend} positiveIsGood={false} icon={<DollarSign className="h-4 w-4" />} />
                <KpiCard label="Conversions" value={String(q.data?.kpi.conversions ?? 0)} trend={q.data?.kpi.conversionsTrend} icon={<Target className="h-4 w-4" />} />
                <KpiCard label="Cost / result" value={currency(q.data?.kpi.costPerResult ?? 0)} trend={q.data?.kpi.costPerResultTrend} positiveIsGood={false} icon={<Zap className="h-4 w-4" />} />
                <KpiCard label="ROAS" value={`${(q.data?.kpi.roas ?? 0).toFixed(2)}x`} trend={q.data?.kpi.roasTrend} icon={<TrendingUp className="h-4 w-4" />} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <SectionCard
              className="lg:col-span-2"
              title="Spend & results"
              action={
                <Tabs value={chartMode} onValueChange={setChartMode}>
                  <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            >
              {q.data?.series?.length ? (
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={q.data.series}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EBEF" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#5A6577" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#5A6577" }} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E9EBEF" }} />
                      <Bar dataKey="spend" fill="#1F57F5" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="results" fill="#86A8FA" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No spend to chart yet" description="Once your first campaign runs, the chart fills in here." />
              )}
            </SectionCard>

            <SectionCard title="Needs your attention">
              {(q.data?.needsAttention ?? []).length ? (
                <ul className="space-y-3">
                  {q.data!.needsAttention.map((i) => (
                    <li key={i.id} className="rounded-[10px] border border-border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`h-4 w-4 ${i.severity === "critical" ? "text-danger" : i.severity === "medium" ? "text-warn" : "text-info"}`} />
                        <span className="text-[13px] font-semibold">{i.finding}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-2">{i.why}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => toast.success("Applied")} className="h-7 gap-1"><Check className="h-3 w-3" />Apply</Button>
                        <Button size="sm" variant="ghost" className="h-7 gap-1"><X className="h-3 w-3" />Dismiss</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="You're all clear" description="Growzzy flags issues here as they appear." />
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard className="lg:col-span-2" title="Top campaigns" padding={false}>
              {q.data?.topCampaigns?.length ? (
                <div className="divide-y divide-border">
                  {q.data.topCampaigns.map((c) => (
                    <div key={c.id} className="grid grid-cols-6 gap-4 px-5 py-3 items-center text-[13px]">
                      <div className="col-span-2 font-medium truncate">{c.name}</div>
                      <div><CampaignStatusPill status={c.status} /></div>
                      <div className="tnum">{currency(c.spend)}</div>
                      <div className="tnum">{c.conversions}</div>
                      <div className="tnum">{c.roas.toFixed(2)}x</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No live campaigns yet" description="Launch your first campaign to see top performers here." />
              )}
            </SectionCard>

            <div className="space-y-4">
              <SectionCard title="Google Ads">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Not connected</span>
                  <Button size="sm">Connect</Button>
                </div>
              </SectionCard>
              <SectionCard title="Meta Ads">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Coming soon</span>
                  <Button size="sm" variant="outline" disabled>Coming soon</Button>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// silence unused import warnings for line/tooltip variants when tree-shaken
export const _unused = { LineChart, Line };
