import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageHeader, SettingsSection } from "./_app.settings";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/settings/billing")({
  component: BillingPage,
});

function BillingPage() {
  // Billing UI is honest — no fake invoices until Stripe is wired.
  const stripeReady = false;

  return (
    <>
      <SettingsPageHeader
        title="Billing"
        description="Plans, payment method and invoice history."
      />

      {!stripeReady ? (
        <SettingsSection title="Billing">
          <div className="flex flex-col items-center justify-center text-center py-10 px-6">
            <div className="h-12 w-12 rounded-full bg-primary-tint text-primary grid place-items-center mb-4">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="text-[14px] font-semibold">Billing coming soon</div>
            <p className="text-[12.5px] text-muted-foreground mt-1 max-w-sm">
              Growzzy is free while we finalize billing. You'll see your plan, payment method and invoices here once Stripe is live.
            </p>
          </div>
        </SettingsSection>
      ) : (
        <>
          <SettingsSection title="Current plan">{/* real plan card here */}</SettingsSection>
          <SettingsSection title="Payment method">{/* real card details here */}</SettingsSection>
          <SettingsSection title="Invoice history">{/* real table here */}</SettingsSection>
        </>
      )}
    </>
  );
}
