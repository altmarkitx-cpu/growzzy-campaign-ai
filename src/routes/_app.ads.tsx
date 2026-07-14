import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionCard, EmptyState, SkeletonPanel } from "@/components/growzzy/primitives";
import { CampaignStatusPill } from "@/components/growzzy/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { endpoints } from "@/lib/api";
import { RefreshCw, Plus, MoreHorizontal, Megaphone, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { Campaign, Platform, CampaignStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/ads")({
  head: () => ({ meta: [{ title: "Ads Manager · Growzzy OS" }] }),
  component: AdsManagerPage,
});

const currency = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function AdsManagerPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | Platform>("all");
  const [status, setStatus] = useState<"all" | CampaignStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = useQuery({ queryKey: ["campaigns"], queryFn: endpoints.campaigns.list, retry: false });

  const rows = useMemo(() => {
    const list = q.data ?? [];
    return list.filter(
      (c) =>
        (platform === "all" || c.platform === platform) &&
        (status === "all" || c.status === status) &&
        (query === "" || c.name.toLowerCase().includes(query.toLowerCase())),
    );
  }, [q.data, query, platform, status]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div>
      <PageHeader
        title="Ads Manager"
        subtitle="Every campaign Growzzy has launched or imported."
        actions={
          <>
            <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
            <Button onClick={() => navigate({ to: "/" })} className="gap-1.5"><Plus className="h-4 w-4" />New campaign</Button>
          </>
        }
      />

      <SectionCard padding={false}>
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search campaigns" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="meta">Meta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary-tint border-b border-border text-[13px]">
            <span className="font-medium text-primary">{selected.size} selected</span>
            <Button size="sm" variant="ghost">Pause</Button>
            <Button size="sm" variant="ghost">Enable</Button>
            <Button size="sm" variant="ghost">Duplicate</Button>
          </div>
        )}

        {q.isLoading ? (
          <div className="p-6"><SkeletonPanel rows={6} /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-6 w-6" />}
            title={q.isError ? "Connect Google Ads to see campaigns" : "No campaigns yet"}
            description={q.isError ? "Once you connect, all your Google campaigns appear here." : "Launch one from New Campaign and it shows up here."}
            action={<Button onClick={() => navigate({ to: "/" })}>Create your first campaign</Button>}
          />
        ) : (
          <div>
            <div className="grid grid-cols-[32px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_32px] gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
              <div></div>
              <div>Name</div>
              <div>Status</div>
              <div>Spend</div>
              <div>Clicks</div>
              <div>Conversions</div>
              <div>CPA</div>
              <div>ROAS</div>
              <div></div>
            </div>
            {rows.map((c: Campaign) => (
              <Popover key={c.id}>
                <PopoverTrigger asChild>
                  <div className="grid grid-cols-[32px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_32px] gap-2 px-4 items-center border-b border-border text-[13px] hover:bg-muted/40 cursor-pointer" style={{ height: 52 }}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggle(c.id)} />
                    </div>
                    <div className="font-medium truncate flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-sm bg-primary-tint text-primary text-[9px] font-bold grid place-items-center">{c.platform === "google" ? "G" : "M"}</span>
                      {c.name}
                    </div>
                    <div><CampaignStatusPill status={c.status} /></div>
                    <div className="tnum">{currency(c.spend)}</div>
                    <div className="tnum">{c.clicks.toLocaleString()}</div>
                    <div className="tnum">{c.conversions}</div>
                    <div className="tnum">{currency(c.cpa)}</div>
                    <div className="tnum">{c.roas.toFixed(2)}x</div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Pause</DropdownMenuItem>
                          <DropdownMenuItem>Enable</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="text-[14px] font-semibold mb-1">{c.name}</div>
                  <div className="mb-3"><CampaignStatusPill status={c.status} /></div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] mb-3">
                    <div><div className="text-muted-foreground">Daily budget</div><div className="tnum font-medium">{currency(c.budgetDaily)}</div></div>
                    <div><div className="text-muted-foreground">ROAS</div><div className="tnum font-medium">{c.roas.toFixed(2)}x</div></div>
                  </div>
                  <div className="flex gap-2"><Button size="sm">Pause</Button><Button size="sm" variant="outline">Duplicate</Button></div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
