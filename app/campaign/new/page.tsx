"use client";

import { AgentChat } from "@/components/growzzy/agent-chat";
import { NextShell } from "@/components/growzzy/next-shell";

export default function NewCampaignPage() {
  return (
    <NextShell>
      <AgentChat threadId="growzzy-new-campaign" />
    </NextShell>
  );
}
