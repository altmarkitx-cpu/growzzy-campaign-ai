import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatBuilder } from "@/components/growzzy/chat-builder";
import { endpoints } from "@/lib/api";
import { toast } from "sonner";
import type { CampaignPlan } from "@/lib/types";

export const Route = createFileRoute("/_app/builder/$planId")({
  head: () => ({ meta: [{ title: "Campaign Builder · Growzzy OS" }] }),
  component: BuilderPage,
});

function BuilderPage() {
  const { planId } = useParams({ from: "/_app/builder/$planId" });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const q = useQuery<CampaignPlan | null>({
    queryKey: ["plan", planId],
    queryFn: () => endpoints.ai.getPlan(planId),
    retry: false,
  });

  const patch = useMutation({
    mutationFn: (p: Partial<CampaignPlan>) => endpoints.ai.updatePlan(planId, p),
    onSuccess: (data) => qc.setQueryData(["plan", planId], data),
  });

  const launch = useMutation({
    mutationFn: () => endpoints.ai.launch(planId),
    onSuccess: (r) =>
      toast.success(`Launched — Google campaign ${r.googleCampaignId} (starts paused)`, {
        action: { label: "Go to Ads Manager", onClick: () => navigate({ to: "/ads" }) },
      }),
    onError: (e: { message?: string }) => toast.error(e?.message ?? "Couldn't launch — try again."),
  });

  const handleSend = async (_text: string) => {
    // Refinement message sent by the user — a real backend would patch the plan.
    // We keep the mutation available so future adjustments hit the API.
    void patch;
  };

  return (
    <ChatBuilder
      plan={q.data ?? null}
      onSend={handleSend}
      onLaunch={() => launch.mutate()}
      launching={launch.isPending}
    />
  );
}
