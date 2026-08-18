import { analyzeWebsite } from "@/lib/ai-gateway.server";

export async function POST(request: Request) {
  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  const { result, error, status } = await analyzeWebsite(url ?? "");
  if (error || !result) return Response.json({ error: error ?? "Analysis failed." }, { status: status ?? 400 });
  return Response.json(result);
}
