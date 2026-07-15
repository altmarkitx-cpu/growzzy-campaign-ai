import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageHeader, SettingsSection } from "./_app.settings";
import { StatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw, ArrowLeftRight, Link2Off } from "lucide-react";

export const Route = createFileRoute("/_app/settings/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const connected = false; // stub — flip when API is wired

  return (
    <>
      <SettingsPageHeader
        title="Integrations"
        description="Ad platforms Growzzy connects to. Google is fully supported today."
      />

      <SettingsSection title="Google Ads">
        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusPill variant="success">Connected</StatusPill>
                </div>
                <div className="text-[13.5px] font-medium">Anand Marketing · 512-874-3910</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">Last synced 2 minutes ago</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="outline" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Sync now</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><ArrowLeftRight className="h-3.5 w-3.5" />Switch ad account</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5 text-danger border-danger/30 hover:bg-danger-bg">
                    <Link2Off className="h-3.5 w-3.5" />Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Google Ads?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Growzzy will stop syncing performance and can't launch or optimize campaigns until you reconnect. Existing live campaigns stay on your Google account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-danger text-white hover:bg-danger/90">Disconnect</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1"><StatusPill variant="draft">Not connected</StatusPill></div>
              <p className="text-[13px] text-muted-foreground max-w-md">Connect your Google Ads account so Growzzy can launch, sync and optimize campaigns on your behalf.</p>
            </div>
            <Button className="gap-1.5">Connect Google Ads</Button>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Meta Ads">
        <div className="flex items-center justify-between opacity-70">
          <div>
            <div className="mb-1"><StatusPill variant="info">Coming soon</StatusPill></div>
            <p className="text-[13px] text-muted-foreground max-w-md">
              Meta Ads support is on the way — Google Ads is fully supported today.
            </p>
          </div>
          <Button disabled variant="outline">Coming soon</Button>
        </div>
      </SettingsSection>
    </>
  );
}
