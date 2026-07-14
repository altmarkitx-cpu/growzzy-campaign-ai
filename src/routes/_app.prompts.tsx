import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { StatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/lib/api";
import { Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_app/prompts")({
  head: () => ({ meta: [{ title: "Recent Prompts · Growzzy OS" }] }),
  component: PromptsPage,
});

function PromptsPage() {
  const q = useQuery({ queryKey: ["prompts"], queryFn: endpoints.prompts.list, retry: false });
  return (
    <div>
      <PageHeader title="Recent Prompts" subtitle="Your saved campaign briefs — re-run or edit any of them." />
      {q.isLoading ? (
        <SectionCard><SkeletonPanel rows={5} /></SectionCard>
      ) : (q.data ?? []).length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<Lightbulb className="h-6 w-6" />}
            title="Your saved campaign prompts appear here"
            description="Every plan you build from New Campaign gets saved so you can re-use it."
          />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {q.data!.map((p) => (
            <SectionCard key={p.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusPill variant="primary">{p.goal}</StatusPill>
                    <span className="text-[12px] text-muted-foreground tnum">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[14px] text-foreground/90">{p.text}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Re-run</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm" variant="ghost">Delete</Button>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
