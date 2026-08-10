import { createFileRoute } from "@tanstack/react-router";
import { analyzeWebsite } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/analyze-site")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { url } = (await request.json().catch(() => ({}))) as { url?: string };

        const { result, error, status } = await analyzeWebsite(url ?? "");
        if (error) return Response.json({ error }, { status: status ?? 500 });
        return Response.json(result);
      },
    },
  },
});
