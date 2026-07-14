import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/growzzy/primitives";
import { StatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/settings/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <div className="space-y-4">
      <SectionCard title="Google Ads">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1"><StatusPill variant="draft">Not connected</StatusPill></div>
            <p className="text-[13px] text-muted-foreground">Connect your Google Ads account to launch and manage campaigns.</p>
          </div>
          <Button>Connect Google Ads</Button>
        </div>
      </SectionCard>
      <SectionCard title="Meta Ads">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1"><StatusPill variant="info">Coming soon</StatusPill></div>
            <p className="text-[13px] text-muted-foreground">Google is fully supported today — Meta arrives next.</p>
          </div>
          <Button disabled variant="outline">Coming soon</Button>
        </div>
      </SectionCard>
    </div>
  );
}
