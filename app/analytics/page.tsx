import { NextShell } from "@/components/growzzy/next-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { LineChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return <NextShell><PageHeader title="Analytics" subtitle="Deep dive into every campaign, keyword and audience." actions={<Button variant="outline" className="gap-2"><Sparkles data-icon="inline-start" />AI insights</Button>} /><div className="grid grid-cols-1 gap-4 lg:grid-cols-4"><SectionCard className="lg:col-span-3" title="Performance over time"><EmptyState icon={<LineChart className="h-6 w-6" />} title="No data to chart" description="Connect Google Ads and launch a campaign to see performance here." /></SectionCard><SectionCard title="AI insights"><EmptyState icon={<Sparkles className="h-5 w-5" />} title="Insights appear here" description="Once campaigns have data, Growzzy explains what is working and what to change." /></SectionCard></div></NextShell>;
}
