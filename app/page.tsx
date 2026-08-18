"use client";

import { usePathname, useRouter } from "next/navigation";
import { AgentChat } from "@/components/growzzy/agent-chat";
import { cn } from "@/lib/utils";
import { BarChart3, Bot, BriefcaseBusiness, ChevronDown, Grid2X2, LayoutDashboard, Megaphone, Settings2, Sparkles, Target, Zap } from "lucide-react";

const nav = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "Campaigns", icon: Megaphone, href: "/campaigns" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "My Brand", icon: BriefcaseBusiness, href: "/brand" },
];

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-[218px] shrink-0 border-r border-border bg-sidebar px-3 py-4 md:flex md:flex-col">
        <button className="mb-7 flex items-center gap-2 rounded-lg px-2 text-left" onClick={() => router.push("/")}>
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
          <span className="text-[15px] font-semibold tracking-tight">Growzzy <span className="text-muted-foreground">OS</span></span>
        </button>
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ label, icon: Icon, href }) => (
            <button key={href} onClick={() => router.push(href)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", pathname === href && "bg-accent font-medium text-foreground")}>
              <Icon className="size-4" />{label}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button onClick={() => router.push("/settings")} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-4" />Settings</button>
          <div className="mt-3 flex items-center gap-2 border-t border-border px-2 pt-4"><span className="grid size-7 place-items-center rounded-full bg-secondary text-xs font-semibold">MO</span><span className="min-w-0 flex-1 truncate text-xs">Workspace owner</span><ChevronDown className="size-3 text-muted-foreground" /></div>
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-5 md:px-8"><div className="flex items-center gap-2 text-sm font-medium"><Bot className="size-4 text-primary" />Campaign agent</div><div className="flex items-center gap-2"><button className="hidden rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground sm:block">⌘K&nbsp; Quick find</button><button className="grid size-8 place-items-center rounded-full border border-border text-xs">MO</button></div></header>
        <AgentChat />
      </section>
    </main>
  );
}
