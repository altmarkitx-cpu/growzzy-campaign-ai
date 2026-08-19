"use client";

import { NextShell } from "@/components/growzzy/next-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { PlugZap, Download, DollarSign, Target, Zap, TrendingUp } from "lucide-react";

const stats = [
  ["Spend (7d)", "$0", DollarSign],
  ["Conversions", "0", Target],
  ["Cost / result", "$0", Zap],
  ["ROAS", "—", TrendingUp],
] as const;

export default function DashboardPage() {
  return (
    <NextShell>
      <PageHeader title="Dashboard" subtitle="Everything Growzzy is doing across your ad accounts." actions={<Button variant="outline" className="gap-2"><Download data-icon="inline-start" />Export</Button>} />
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, Icon]) => (
          <SectionCard key={label}>
            <div className="flex items-center justify-between"><span className="text-[13px] text-muted-foreground">{label}</span><Icon className="h-4 w-4 text-primary" /></div>
            <div className="mt-3 text-2xl font-semibold tnum">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">No data yet</div>
          </SectionCard>
        ))}
      </div>
      <SectionCard>
        <EmptyState icon={<PlugZap className="h-6 w-6" />} title="Connect Google Ads to see your dashboard" description="Once connected, Growzzy pulls live spend, results and ROAS so this page comes to life." action={<Button>Connect Google Ads</Button>} />
      </SectionCard>
    </NextShell>
  );
}
