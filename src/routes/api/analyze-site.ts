import { createFileRoute } from "@tanstack/react-router";
import { analyzeWebsite } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/analyze-site")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { url } = (await request.json().catch(() => ({}))) as { url?: string };

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured yet." }, { status: 500 });

        const { result, error, status } = await analyzeWebsite(apiKey, url ?? "");
        if (error) return Response.json({ error }, { status: status ?? 500 });
        return Response.json(result);
      },
    },
  },
});
