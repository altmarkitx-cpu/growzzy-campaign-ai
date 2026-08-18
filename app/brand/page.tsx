"use client";

import { useState } from "react";
import { useBrand, setBrand, type BrandContext } from "@/lib/brand-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileDown, Globe, Save, Sparkles } from "lucide-react";

const fields: { key: keyof BrandContext; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "businessName", label: "Business name", placeholder: "Your company" },
  { key: "website", label: "Website", placeholder: "https://example.com" },
  { key: "industry", label: "Industry", placeholder: "B2B SaaS, ecommerce, agency…" },
  { key: "productDescription", label: "What you sell", placeholder: "Describe the offer in your own words", multiline: true },
  { key: "audience", label: "Ideal customer", placeholder: "Who buys and why", multiline: true },
  { key: "tone", label: "Brand voice", placeholder: "Direct, warm, technical, confident…" },
  { key: "defaultLandingPage", label: "Default landing page", placeholder: "https://example.com/demo" },
];

export default function BrandPage() {
  const brand = useBrand();
  const [draft, setDraft] = useState<BrandContext>(brand);
  const [analyzing, setAnalyzing] = useState(false);

  const update = (key: keyof BrandContext, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const save = () => {
    setBrand(draft);
    toast.success("Brand context saved. The chat will use these values immediately.");
  };

  const analyze = async () => {
    if (!draft.website.trim()) return toast.error("Add a website URL first.");
    setAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: draft.website }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");
      setDraft((current) => ({ ...current, websiteAnalysis: data.analysis, websiteAnalyzedAt: data.analyzedAt }));
      toast.success("Research updated. Review it, then save your brand.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF();
    const text = [
      `${draft.businessName || "Brand"} — My Brand research`,
      `Generated ${new Date().toLocaleString()}`,
      "",
      `Business model / offer: ${draft.productDescription || "Not provided"}`,
      `ICP: ${draft.audience || "Not provided"}`,
      `Industry: ${draft.industry || "Not provided"}`,
      `Website: ${draft.website || "Not provided"}`,
      "",
      "Latest website research:",
      draft.websiteAnalysis || "No website research saved yet.",
      "",
      `Source: ${draft.website || "User-provided brand context"}`,
    ].join("\n");
    const lines = pdf.splitTextToSize(text, 175);
    pdf.text(lines, 18, 20);
    pdf.save(`${(draft.businessName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-research.pdf`);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace context</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">My Brand</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Edit the source of truth Growzzy uses for every answer, campaign, question, audience, and creative.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportPdf}><FileDown data-icon="inline-start" />Export research PDF</Button>
            <Button onClick={save}><Save data-icon="inline-start" />Save brand</Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="card-surface flex flex-col gap-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className={field.multiline ? "sm:col-span-2" : ""}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea id={field.key} className="mt-2 min-h-24" value={String(draft[field.key] || "")} placeholder={field.placeholder} onChange={(event) => update(field.key, event.target.value)} />
                  ) : (
                    <Input id={field.key} className="mt-2" value={String(draft[field.key] || "")} placeholder={field.placeholder} onChange={(event) => update(field.key, event.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface flex min-h-[420px] flex-col p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Latest research</h2>
                <p className="mt-1 text-xs text-muted-foreground">Real site analysis becomes editable context for chat.</p>
              </div>
              <Button variant="outline" size="sm" disabled={analyzing} onClick={analyze}><Globe data-icon="inline-start" />{analyzing ? "Analyzing…" : "Analyze website"}</Button>
            </div>
            {draft.websiteAnalysis ? (
              <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{draft.websiteAnalysis}</div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-muted-foreground"><Sparkles className="mb-3 size-5 text-primary" /><p>Add a website and run analysis to populate business model, ICP, competitors, keywords, and source context.</p></div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
