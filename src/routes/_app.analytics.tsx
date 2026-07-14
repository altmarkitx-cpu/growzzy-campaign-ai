import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, EmptyState } from "@/components/growzzy/primitives";
import { KpiCard } from "@/components/growzzy/kpi-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, LineChart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics · Growzzy OS" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [metric, setMetric] = useState("spend");
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Deep dive into every campaign, keyword and audience."
        actions={<Button variant="outline" className="gap-1.5"><Sparkles className="h-4 w-4" />AI insights</Button>}
      />

      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="meta">Meta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard label="Spend" value="$0" caption="No data yet" />
        <KpiCard label="Clicks" value="0" caption="No data yet" />
        <KpiCard label="Conversions" value="0" caption="No data yet" />
        <KpiCard label="ROAS" value="—" caption="No data yet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <SectionCard
          className="lg:col-span-3"
          title="Performance over time"
          action={
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="spend">Spend</SelectItem>
                <SelectItem value="clicks">Clicks</SelectItem>
                <SelectItem value="ctr">CTR</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
                <SelectItem value="cpa">CPA</SelectItem>
                <SelectItem value="roas">ROAS</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="h-64 grid place-items-center">
            <EmptyState icon={<LineChart className="h-6 w-6" />} title="No data to chart" description="Connect Google Ads and launch a campaign to see performance here." />
          </div>

          <div className="mt-4">
            <Tabs defaultValue="campaign">
              <TabsList>
                <TabsTrigger value="campaign">By campaign</TabsTrigger>
                <TabsTrigger value="keyword">By keyword</TabsTrigger>
                <TabsTrigger value="device">By device / geo</TabsTrigger>
              </TabsList>
              <TabsContent value="campaign"><EmptyState title="No campaigns yet" /></TabsContent>
              <TabsContent value="keyword"><EmptyState title="No keyword data yet" /></TabsContent>
              <TabsContent value="device"><EmptyState title="No device data yet" /></TabsContent>
            </Tabs>
          </div>
        </SectionCard>

        <SectionCard title="AI insights">
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="Insights appear here"
            description="Once your campaigns have data, Growzzy explains what's working and what to change — with the numbers to back it up."
          />
        </SectionCard>
      </div>
    </div>
  );
}
