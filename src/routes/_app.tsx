import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { AppSidebar, TopBar } from "@/components/growzzy/app-sidebar";
import { CommandPalette, useCommandPalette } from "@/components/growzzy/command-palette";
import { Button } from "@/components/ui/button";
import { Bell, HelpCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-canvas">
      <AppSidebar onOpenPalette={() => setOpen(true)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          onOpenPalette={() => setOpen(true)}
          right={
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings/general" aria-label="Help">
                  <HelpCircle className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <Button onClick={() => navigate({ to: "/" })} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New campaign
              </Button>
            </>
          }
        />
        <main className="flex-1 min-w-0 p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
