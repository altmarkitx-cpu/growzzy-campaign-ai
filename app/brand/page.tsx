"use client";

import { useEffect, useState } from "react";
import { NextShell } from "@/components/growzzy/next-shell";
import { PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Globe, Loader2, Sparkles } from "lucide-react";
import { emptyBrand, loadBrand, saveBrand, type BrandProfile } from "@/lib/brand-store";

export default function BrandPage() {
  const [brand, setBrand] = useState<BrandProfile>(emptyBrand);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = loadBrand();
    setBrand(saved);
    setUrl(saved.website);
  }, []);

  const update = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) =>
    setBrand((current) => ({ ...current, [key]: value }));

  async function analyze() {
    if (!url.trim()) {
      toast.error("Add your website URL first.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/brand/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!response.ok) throw new Error("Brand analysis failed.");
      const result = await response.json();
      const next = {
        ...brand,
        ...result.profile,
        website: result.site ?? url.trim(),
        defaultLandingPage: brand.defaultLandingPage || result.site || url.trim(),
        analyzedAt: new Date().toISOString(),
      } satisfies BrandProfile;
      setBrand(next);
      saveBrand(next);
      toast.success("Brand context connected to new campaigns.");
    } catch {
      toast.error("Could not analyse that website yet.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    saveBrand(brand);
    await fetch("/api/brand", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(brand),
    });
    window.dispatchEvent(new Event("growzzy:brand-updated"));
    toast.success("Brand context saved.");
  }

  return (
    <NextShell>
      <PageHeader
        title="My Brand"
        subtitle="Connect your brand once, then use it directly inside every new campaign."
        actions={
          <Button onClick={save} className="gap-2">
            <Check className="size-4" /> Save brand context
          </Button>
        }
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <SectionCard title="Website analysis">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <Label htmlFor="brand-url">Your website URL</Label>
                <div className="relative mt-2">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="brand-url" value={url} onChange={(event) => setUrl(event.target.value)} className="pl-9" placeholder="yourbrand.com" />
                </div>
              </div>
              <Button onClick={analyze} disabled={busy} className="gap-2">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {busy ? "Analysing…" : "Analyse my business"}
              </Button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Growzzy turns your website into reusable campaign context: offer, positioning, audience, tone, and landing page.</p>
          </SectionCard>
          <SectionCard title="Business context">
            <div className="grid gap-4 md:grid-cols-2">
              <div><Label htmlFor="business-name">Business name</Label><Input id="business-name" className="mt-2" value={brand.businessName} onChange={(e) => update("businessName", e.target.value)} /></div>
              <div><Label htmlFor="industry">Industry</Label><Input id="industry" className="mt-2" value={brand.industry} onChange={(e) => update("industry", e.target.value)} /></div>
              <div className="md:col-span-2"><Label htmlFor="offer">What you sell</Label><Textarea id="offer" className="mt-2" value={brand.whatTheySell} onChange={(e) => update("whatTheySell", e.target.value)} rows={3} /></div>
              <div className="md:col-span-2"><Label htmlFor="positioning">Positioning</Label><Textarea id="positioning" className="mt-2" value={brand.positioning} onChange={(e) => update("positioning", e.target.value)} rows={3} /></div>
              <div className="md:col-span-2"><Label htmlFor="audience">Ideal customer</Label><Input id="audience" className="mt-2" value={brand.audience} onChange={(e) => update("audience", e.target.value)} /></div>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Campaign connection">
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">New campaign uses this context</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Your next campaign brief will start with this business, audience, and positioning data.</p>
            </div>
            <a href="/campaign/new" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Create a campaign</a>
            <div className="text-xs text-muted-foreground">{brand.analyzedAt ? `Last updated ${new Date(brand.analyzedAt).toLocaleDateString()}` : "No analysis connected yet"}</div>
          </div>
        </SectionCard>
      </div>
    </NextShell>
  );
}
