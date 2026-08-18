import { createFileRoute } from "@tanstack/react-router";
import { AgentChat } from "@/components/growzzy/agent-chat";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "AI Campaign Builder · Growzzy OS" },
      {
        name: "description",
        content:
          "Describe your offer and Growzzy researches the market, asks what it needs, plans the build and delivers a launch-ready ad campaign with creative.",
      },
      { property: "og:title", content: "AI Campaign Builder · Growzzy OS" },
      {
        property: "og:description",
        content: "Research, plan and launch complete ad campaigns from one conversation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewCampaignPage,
});

function NewCampaignPage() {
  return <AgentChat threadId="growzzy-new-campaign" />;
}
