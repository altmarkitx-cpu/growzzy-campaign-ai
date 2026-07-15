import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageHeader, SettingsSection } from "./_app.settings";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

const notifications = [
  {
    key: "digest",
    title: "Weekly performance digest",
    desc: "Email summary of spend, results and AI actions from the past week.",
    defaultOn: true,
  },
  {
    key: "optimization",
    title: "Optimization alerts",
    desc: "Email when AI flags something critical — zero-conversion spend, policy rejection.",
    defaultOn: true,
  },
  {
    key: "budget",
    title: "Budget alerts",
    desc: "Email if a campaign is approaching its daily ceiling.",
    defaultOn: true,
  },
  {
    key: "product",
    title: "Product updates",
    desc: "Occasional announcements about new Growzzy features.",
    defaultOn: false,
  },
];

export const Route = createFileRoute("/_app/settings/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [state, setState] = useState(() =>
    Object.fromEntries(notifications.map((n) => [n.key, n.defaultOn])) as Record<string, boolean>,
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast.success("Notification preferences saved.");
  };

  return (
    <>
      <SettingsPageHeader
        title="Notifications"
        description="Choose which emails Growzzy sends you."
        onSave={save}
        saving={saving}
      />

      <SettingsSection title="Email notifications">
        <div className="divide-y divide-border">
          {notifications.map((n) => (
            <div key={n.key} className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
              <div>
                <div className="text-[13.5px] font-medium">{n.title}</div>
                <div className="text-[12.5px] text-muted-foreground mt-0.5 max-w-md">{n.desc}</div>
              </div>
              <Switch
                checked={state[n.key]}
                onCheckedChange={(v) => setState((s) => ({ ...s, [n.key]: v }))}
              />
            </div>
          ))}
        </div>
      </SettingsSection>
    </>
  );
}
