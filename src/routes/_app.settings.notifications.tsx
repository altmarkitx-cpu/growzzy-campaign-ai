import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/growzzy/primitives";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: () => (
    <SectionCard title="Email notifications">
      {[
        { title: "Weekly performance digest", desc: "A short summary of what changed and what to try next." },
        { title: "Optimization alerts", desc: "When Growzzy finds something urgent worth fixing." },
        { title: "Budget alerts", desc: "When a campaign is close to your daily ceiling." },
      ].map((n, i) => (
        <div key={n.title} className={`flex items-center justify-between py-4 ${i > 0 ? "border-t border-border" : ""}`}>
          <div>
            <div className="text-[14px] font-medium">{n.title}</div>
            <div className="text-[13px] text-muted-foreground">{n.desc}</div>
          </div>
          <Switch defaultChecked />
        </div>
      ))}
    </SectionCard>
  ),
});
