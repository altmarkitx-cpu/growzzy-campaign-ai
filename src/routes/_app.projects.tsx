import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/lib/api";
import { FolderKanban, Plus, MoreHorizontal, Search, Megaphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects · Growzzy OS" }] }),
  component: ProjectsPage,
});

const gradients = [
  "from-[#1F57F5] to-[#7BA3FF]",
  "from-[#F97316] to-[#FBBF77]",
  "from-[#059669] to-[#6EE7B7]",
  "from-[#E11D48] to-[#FDA4AF]",
  "from-[#7C3AED] to-[#C4B5FD]",
  "from-[#0EA5E9] to-[#7DD3FC]",
];

function ProjectsPage() {
  const [query, setQuery] = useState("");
  const q = useQuery({ queryKey: ["projects"], queryFn: endpoints.projects.list, retry: false });
  const projects = (q.data ?? []).filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Group related campaigns by product, region or season."
        actions={
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="pl-9"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-surface overflow-hidden animate-pulse">
              <div className="h-32 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title={query ? "No projects match that search" : "No projects yet"}
            description={query ? "Try a different name." : "Create a project to organize campaigns by product, region or season."}
            action={!query && <Button className="gap-1.5"><Plus className="h-4 w-4" />Create your first project</Button>}
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <Link
              key={p.id}
              to="/ads"
              className="group card-surface overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className={`relative h-32 bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                <FolderKanban className="h-10 w-10 text-white/90" />
                <button
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/20 backdrop-blur grid place-items-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/30"
                  onClick={(e) => { e.preventDefault(); }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-foreground truncate">{p.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Megaphone className="h-3 w-3" />
                      {p.campaignCount} {p.campaignCount === 1 ? "campaign" : "campaigns"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-muted-foreground">Spend</div>
                    <div className="text-[13px] font-semibold tnum">${p.totalSpend.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* New project tile */}
          <button className="card-surface border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary-tint/30 transition-colors flex flex-col items-center justify-center py-12 text-muted-foreground hover:text-primary">
            <div className="h-10 w-10 rounded-full bg-primary-tint text-primary grid place-items-center mb-2">
              <Plus className="h-4 w-4" />
            </div>
            <div className="text-[13px] font-medium">New project</div>
          </button>
        </div>
      )}
    </div>
  );
}
