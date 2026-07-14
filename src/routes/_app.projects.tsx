import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/lib/api";
import { FolderKanban, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects · Growzzy OS" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const q = useQuery({ queryKey: ["projects"], queryFn: endpoints.projects.list, retry: false });

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Group related campaigns together."
        actions={<Button className="gap-1.5"><Plus className="h-4 w-4" />New project</Button>}
      />

      {q.isLoading ? (
        <SectionCard><SkeletonPanel rows={4} /></SectionCard>
      ) : (q.data ?? []).length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title="No projects yet"
            description="Create a project to organize campaigns by product, region or season."
            action={<Button>Create your first project</Button>}
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {q.data!.map((p) => (
            <SectionCard key={p.id} title={p.name}>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><div className="text-muted-foreground">Campaigns</div><div className="font-medium tnum">{p.campaignCount}</div></div>
                <div><div className="text-muted-foreground">Total spend</div><div className="font-medium tnum">${p.totalSpend.toLocaleString()}</div></div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
