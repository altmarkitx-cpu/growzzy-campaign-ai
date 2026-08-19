"use client";

import { useState } from "react";
import { NextShell } from "@/components/growzzy/next-shell";
import { EmptyState, PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderKanban, Plus, Search } from "lucide-react";

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  return (
    <NextShell>
      <PageHeader title="Projects" subtitle="Group related campaigns by product, region or season." actions={<Button className="gap-2"><Plus data-icon="inline-start" />New project</Button>} />
      <div className="mb-4 flex max-w-md items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects…" /></div>
      <SectionCard>
        <EmptyState icon={<FolderKanban className="h-6 w-6" />} title={query ? "No projects match that search" : "No projects yet"} description={query ? "Try a different name." : "Create a project to organize campaigns by product, region or season."} action={!query && <Button className="gap-2"><Plus data-icon="inline-start" />Create your first project</Button>} />
      </SectionCard>
    </NextShell>
  );
}
