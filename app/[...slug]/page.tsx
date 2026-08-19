import { NextShell } from "@/components/growzzy/next-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const labels: Record<string, [string, string]> = {
  ads: ["Ads Manager", "Manage campaigns, ad groups and delivery status."],
  optimization: ["AI Optimization", "Review recommendations and apply improvements."],
  studio: ["Ad Studio", "Create and organize campaign creative."],
  brand: ["My Brand", "Keep your brand context ready for every campaign."],
  prompts: ["Recent Prompts", "Your saved campaign prompts and brief history."],
  settings: ["Settings", "Manage workspace preferences and connected services."],
};

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = slug[0] ?? "settings";
  const [title, subtitle] = labels[key] ?? [key.replaceAll("-", " "), "This workspace is ready for your data."];
  return <NextShell><PageHeader title={title} subtitle={subtitle} /><SectionCard><EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="Nothing here yet" description="Connect your workspace or create your first item to get started." action={<Button>Get started</Button>} /></SectionCard></NextShell>;
}
