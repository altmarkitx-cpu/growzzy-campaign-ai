import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/growzzy/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Growzzy OS" }] }),
  component: SettingsLayout,
});

const nav = [
  { to: "/settings/general", label: "General" },
  { to: "/settings/integrations", label: "Integrations" },
  { to: "/settings/notifications", label: "Notifications" },
  { to: "/settings/danger", label: "Danger zone" },
];

function SettingsLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <nav className="space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "block rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
                path === n.to ? "bg-primary-tint text-primary" : "text-foreground/80 hover:bg-muted",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
