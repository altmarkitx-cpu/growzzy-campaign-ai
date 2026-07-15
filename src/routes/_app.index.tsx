import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChatBuilder } from "@/components/growzzy/chat-builder";
import { endpoints } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "New Campaign · Growzzy OS" }] }),
  component: NewCampaignPage,
});

function NewCampaignPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleSend = async (text: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const { campaignPlanId } = await endpoints.ai.build(text, {});
      toast.success("Plan ready — opening builder.");
      navigate({ to: "/builder/$planId", params: { planId: campaignPlanId } });
    } catch {
      // Silent: chat continues; toast handled by ChatBuilder if needed.
    } finally {
      setBusy(false);
    }
  };

  return <ChatBuilder onSend={handleSend} plan={null} />;
}
