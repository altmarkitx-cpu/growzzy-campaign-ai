import { Link, useRouterState } from "@tanstack/react-router";
import { useUserProfile, initials } from "@/lib/user-store";
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
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Archive,
  FileText,
  MoreHorizontal,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import logoAsset from "@/assets/growzzy-logo.png.asset.json";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainMenu: NavItem[] = [
  { to: "/", label: "New Campaign", icon: Sparkles },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ads", label: "Ads Manager", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/optimization", label: "AI Optimization", icon: Zap },
  { to: "/studio", label: "Ad Studio", icon: Palette },
  { to: "/brand", label: "My Brand", icon: Monitor },
  { to: "/prompts", label: "Recent Prompts", icon: Lightbulb },
];

const workspaces = [
  { to: "/projects", label: "All workspaces", icon: FolderKanban },
];

const bottom: NavItem[] = [
  { to: "/settings/general", label: "Settings", icon: Settings },
  { to: "/settings/general", label: "Help & Docs", icon: HelpCircle },
];

function Group({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground/70 transition-colors"
      >
        {label}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

function NavRow({ to, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13.5px] font-medium transition-colors",
        active
          ? "bg-primary-tint text-primary"
          : "text-foreground/75 hover:bg-muted",
      )}
    >
      <Icon className="h-[16px] w-[16px] shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border flex flex-col">
      {/* Brand */}
      <div className="px-4 pt-4 pb-4 flex items-center gap-2">
        <img src={logoAsset.url} alt="Growzzy" className="h-7 w-7 object-contain" />
        <div className="leading-tight">
          <div className="text-[14px] font-semibold tracking-tight">Growzzy OS</div>
          <div className="text-[10.5px] text-muted-foreground">AI Ad Platform</div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <Group label="Main menu">
          <ul className="space-y-0.5">
            {mainMenu.map((it) => (
              <li key={it.label}>
                <NavRow {...it} active={isActive(it.to)} />
              </li>
            ))}
          </ul>
        </Group>

        <Group label="Workspaces">
          <ul className="space-y-0.5">
            {workspaces.map((it) => (
              <li key={it.label}>
                <NavRow {...it} active={isActive(it.to)} />
              </li>
            ))}
            <li>
              <div className="mx-3 my-1 border-t border-border" />
            </li>
            {[
              { name: "Growzzy Dashboard" },
              { name: "Campaigns Q4" },
            ].map((w) => (
              <li key={w.name}>
                <button className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13px] text-foreground/70 hover:bg-muted transition-colors">
                  <Building2 className="h-[15px] w-[15px] shrink-0" />
                  <span className="truncate">{w.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Group>
      </div>

      {/* Static bottom nav */}
      <div className="px-2 py-2 space-y-0.5 border-t border-border">
        <button className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13.5px] font-medium text-foreground/75 hover:bg-muted transition-colors">
          <FileText className="h-[16px] w-[16px] shrink-0" />
          Template
        </button>
        <button className="w-full flex items-center gap-2.5 rounded-[8px] px-3 py-[7px] text-[13.5px] font-medium text-foreground/75 hover:bg-muted transition-colors">
          <Archive className="h-[16px] w-[16px] shrink-0" />
          Archive
        </button>
        {bottom.map((it) => (
          <NavRow key={it.label} {...it} active={isActive(it.to)} />
        ))}
      </div>

      {/* User chip */}
      <div className="border-t border-border p-2">
        <UserChip />
      </div>
    </aside>
  );
}

/** Shows the signed-in person's own details; prompts setup when unknown. */
function UserChip() {
  const user = useUserProfile();
  const label = user.name || "Set up your profile";
  const sub = user.email || "Add your name in Settings › General";
  return (
    <Link
      to="/settings/general"
      className="w-full flex items-center gap-2.5 rounded-[10px] p-2 hover:bg-muted transition-colors"
    >
      <div className="h-8 w-8 rounded-full bg-primary/90 text-primary-foreground grid place-items-center text-[12px] font-semibold shrink-0">
        {initials(user) || <Building2 className="h-4 w-4" />}
      </div>
      <div className="flex-1 text-left overflow-hidden">
        <div className="text-[12.5px] font-semibold truncate">{label}</div>
        <div className="text-[10.5px] text-muted-foreground truncate">{sub}</div>
      </div>
      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}



export function TopBar({
  onOpenPalette,
  right,
}: {
  onOpenPalette: () => void;
  right?: React.ReactNode;
}) {
  return (
    <header className="h-14 sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border flex items-center gap-3 px-6">
      <div className="flex-1" />
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 rounded-full bg-muted/70 border border-transparent hover:border-border hover:bg-muted px-3.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors w-[220px]"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <span className="flex-1 text-left">Quick find</span>
        <kbd className="text-[10px] rounded border border-border bg-background px-1 py-0.5 font-sans">⌘K</kbd>
      </button>
      <div className="flex-1 flex items-center justify-end gap-2">{right}</div>
    </header>
  );
}
