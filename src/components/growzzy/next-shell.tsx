"use client";

import { AppSidebar, TopBar } from "@/components/growzzy/app-sidebar";
import { CommandPalette, useCommandPalette } from "@/components/growzzy/command-palette";
import { AgentChat } from "@/components/growzzy/agent-chat";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function NextShell({ children }: { children?: ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  return (
    <div className="min-h-screen flex bg-canvas">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenPalette={() => setOpen(true)}
          right={
            <>
              <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /></Button>
              <Button onClick={() => router.push("/")} className="gap-1.5 h-9"><Plus className="h-4 w-4" />New campaign</Button>
            </>
          }
        />
        <main className="flex-1 min-w-0 p-6">{children ?? <AgentChat threadId="growzzy-new-campaign" />}</main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
