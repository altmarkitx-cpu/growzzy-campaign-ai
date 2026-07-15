import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { User, Building2, Bell, Plug, CreditCard, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Growzzy OS" }] }),
  component: SettingsLayout,
});

const groups = [
  {
    label: "Account",
    items: [
      { to: "/settings/general", label: "General", icon: User },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/settings/integrations", label: "Integrations", icon: Plug },
      { to: "/settings/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Admin",
    items: [
      { to: "/settings/billing", label: "Billing", icon: CreditCard },
    ],
  },
] as const;

function SettingsLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <nav className="space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-3 mb-2 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                {g.label}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((n) => {
                  const active = path === n.to;
                  const Icon = n.icon;
                  return (
                    <li key={n.to}>
                      <Link
                        to={n.to}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13.5px] font-medium transition-colors",
                          active ? "bg-primary-tint text-primary" : "text-foreground/75 hover:bg-muted",
                        )}
                      >
                        <Icon className="h-[15px] w-[15px]" />
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="min-w-0 max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-[13px] font-semibold tracking-tight flex items-center gap-2">
          <span className="text-primary">•</span> {title}
        </h2>
        {description && <p className="text-[12.5px] text-muted-foreground mt-0.5 ml-3.5">{description}</p>}
      </div>
      <div className="card-surface p-5">{children}</div>
    </section>
  );
}

export function SettingsPageHeader({
  title,
  description,
  onSave,
  onDiscard,
  saving,
}: {
  title: string;
  description?: string;
  onSave?: () => void;
  onDiscard?: () => void;
  saving?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-[18px] font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {(onSave || onDiscard) && (
        <div className="flex items-center gap-2 shrink-0">
          {onDiscard && (
            <button
              onClick={onDiscard}
              className="rounded-[8px] border border-border bg-background px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-muted transition-colors"
            >
              Discard Changes
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-[8px] bg-foreground text-background px-3.5 py-1.5 text-[12.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export danger icon so pages can share style
export { ShieldAlert, Building2 };
