import { createFileRoute, useParams } from "@tanstack/react-router";
import { AgentChat } from "@/components/growzzy/agent-chat";

export const Route = createFileRoute("/_app/builder/$planId")({
  head: () => ({
    meta: [
      { title: "Campaign Builder · Growzzy OS" },
      {
        name: "description",
        content:
          "Refine this campaign with Growzzy — adjust targeting, budget, keywords, ad copy and creative in conversation.",
      },
      { property: "og:title", content: "Campaign Builder · Growzzy OS" },
      {
        property: "og:description",
        content: "Refine targeting, budget, copy and creative in one conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BuilderPage,
});

function BuilderPage() {
  const { planId } = useParams({ from: "/_app/builder/$planId" });
  return <AgentChat key={planId} threadId={planId} />;
}
