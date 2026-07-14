import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sparkles,
  FolderKanban,
  Monitor,
  Lightbulb,
  LayoutDashboard,
  Megaphone,
  LineChart,
  Zap,
  Palette,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const create: NavItem[] = [
  { to: "/", label: "New Campaign", icon: Sparkles },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/brand", label: "My Brand", icon: Monitor },
  { to: "/prompts", label: "Recent Prompts", icon: Lightbulb },
];

const manage: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ads", label: "Ads Manager", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/optimization", label: "AI Optimization", icon: Zap },
  { to: "/studio", label: "Ad Studio", icon: Palette },
];

function NavGroup({ label, items, path }: { label: string; items: NavItem[]; path: string }) {
  return (
    <div className="mb-5">
      <div className="group-label px-3 mb-2">{label}</div>
      <ul className="space-y-0.5">
        {items.map((it) => {
          const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-primary-tint text-primary"
                    : "text-foreground/80 hover:bg-muted",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col">
      <div className="px-4 pt-4 pb-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-[8px] bg-primary text-primary-foreground grid place-items-center font-bold">
          G
        </div>
        <span className="text-[15px] font-semibold">Growzzy</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary-tint px-1.5 py-0.5 rounded-full">
          Beta
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <NavGroup label="Create" items={create} path={path} />
        <NavGroup label="Manage" items={manage} path={path} />
      </div>

      <div className="border-t border-border p-3 space-y-3">
        <div className="rounded-[10px] bg-muted/60 p-3">
          <div className="flex items-center justify-between text-[12px] mb-2">
            <span className="font-medium">Getting started</span>
            <span className="text-muted-foreground tnum">0%</span>
          </div>
          <Progress value={0} className="h-1.5" />
        </div>

        <button
          type="button"
          onClick={onOpenPalette}
          className="w-full flex items-center gap-2 rounded-[10px] border border-border bg-background px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-4 w-4" />
          Quick find
          <kbd className="ml-auto text-[10px] rounded border border-border bg-background px-1.5 py-0.5">
            ⌘K
          </kbd>
        </button>

        <button className="w-full flex items-center gap-2 rounded-[10px] p-2 hover:bg-muted transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/90 text-primary-foreground grid place-items-center text-[13px] font-semibold">
            AN
          </div>
          <div className="flex-1 text-left overflow-hidden">
            <div className="text-[13px] font-semibold truncate">Anand Maximizze</div>
            <div className="text-[11px] text-muted-foreground truncate">Anand's Workspace</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}

export function TopBar({
  onOpenPalette,
  right,
}: {
  onOpenPalette: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="h-14 sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border flex items-center gap-3 px-6">
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 rounded-[10px] border border-border bg-background px-3 py-1.5 text-[13px] text-muted-foreground w-72 max-w-full hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        Search campaigns, ads, keywords…
        <kbd className="ml-auto text-[10px] rounded border border-border px-1.5 py-0.5">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </header>
  );
}
