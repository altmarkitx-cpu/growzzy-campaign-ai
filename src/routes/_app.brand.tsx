import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getBrand, setBrand, type BrandContext, type BrandPalette } from "@/lib/brand-store";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Upload, Sparkles, Check, Globe, Loader2 } from "lucide-react";
import { MessageResponse } from "@/components/ai-elements/message";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/brand")({
  head: () => ({ meta: [{ title: "My Brand · Growzzy OS" }] }),
  component: BrandPage,
});

const palettes: BrandPalette[] = [
  { name: "Growzzy", primary: "#1F57F5", accent: "#EAF0FE" },
  { name: "Ember", primary: "#F97316", accent: "#FEF0E6" },
  { name: "Forest", primary: "#059669", accent: "#E7F5EF" },
  { name: "Rose", primary: "#E11D48", accent: "#FCE7EC" },
  { name: "Slate", primary: "#0F172A", accent: "#E9EBEF" },
];

const tones = [
  { value: "friendly", label: "Friendly", sample: "Hey! Grab yours before they're gone ✨" },
  { value: "professional", label: "Professional", sample: "Trusted by 10,000+ businesses worldwide." },
  { value: "playful", label: "Playful", sample: "Warning: dangerously good jewellery inside 💎" },
  { value: "premium", label: "Premium", sample: "Crafted for those who notice the details." },
];

type FormState = Pick<
  BrandContext,
  "businessName" | "website" | "industry" | "tone" | "productDescription" | "defaultLandingPage" | "audience"
>;

const EMPTY_FORM: FormState = {
  businessName: "",
  website: "",
  industry: "",
  tone: "friendly",
  productDescription: "",
  defaultLandingPage: "",
  audience: "",
};

function BrandPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [palette, setPalette] = useState<BrandPalette>(palettes[0]);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | undefined>(undefined);

  // Hydrate from the saved brand on the client (avoids SSR hydration mismatch).
  useEffect(() => {
    const b = getBrand();
    setForm({
      businessName: b.businessName,
      website: b.website,
      industry: b.industry,
      tone: b.tone,
      productDescription: b.productDescription,
      defaultLandingPage: b.defaultLandingPage,
      audience: b.audience,
    });
    if (b.palette) setPalette(b.palette);
    setAnalysis(b.websiteAnalysis);
  }, []);

  const save = () => {
    setSaving(true);
    try {
      setBrand({ ...form, palette });
      toast.success("Brand kit saved. Growzzy will use it on every new campaign.");
    } finally {
      setSaving(false);
    }
  };

  const analyzeSite = async () => {
    const url = form.website.trim();
    if (!url) {
      toast.error("Add your website URL first.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { analysis?: string; error?: string; analyzedAt?: string };
      if (!res.ok || !data.analysis) {
        toast.error(data.error ?? "Couldn't analyze that site.");
        return;
      }
      setAnalysis(data.analysis);
      setBrand({ ...form, palette, websiteAnalysis: data.analysis, websiteAnalyzedAt: data.analyzedAt });
      toast.success("Website analyzed. Growzzy now understands your business.");
    } catch {
      toast.error("Couldn't reach the analyzer — try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const tone = tones.find((t) => t.value === form.tone) ?? tones[0];

  return (
    <div>
      <PageHeader
        title="My Brand"
        subtitle="Set this once — every campaign Growzzy writes uses your brand."
        actions={
          <Button onClick={save} disabled={saving} className="gap-1.5">
            <Check className="h-4 w-4" />
            {saving ? "Saving…" : "Save brand kit"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">
        <div className="space-y-4">
          <SectionCard title="Identity">
            <div className="flex gap-5">
              <div className="shrink-0">
                <Label className="text-[12px]">Logo</Label>
                <div className="mt-1 h-28 w-28 rounded-[14px] border-2 border-dashed border-border grid place-items-center hover:border-primary/40 hover:bg-primary-tint/40 cursor-pointer transition-colors group">
                  <div className="text-center">
                    <Upload className="h-4 w-4 mx-auto text-muted-foreground group-hover:text-primary" />
                    <div className="text-[11px] text-muted-foreground mt-1">Upload</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label className="text-[12px]">Business name</Label><Input value={form.businessName} onChange={(e) => set("businessName")(e.target.value)} className="mt-1" placeholder="Growzzy" /></div>
                <div>
                  <Label className="text-[12px]">Website</Label>
                  <div className="mt-1 flex gap-2">
                    <Input placeholder="https://" value={form.website} onChange={(e) => set("website")(e.target.value)} />
                    <Button type="button" variant="outline" onClick={analyzeSite} disabled={analyzing} className="shrink-0 gap-1.5">
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                      {analyzing ? "Reading…" : "Analyze"}
                    </Button>
                  </div>
                </div>
                <div><Label className="text-[12px]">Industry</Label><Input value={form.industry} onChange={(e) => set("industry")(e.target.value)} className="mt-1" placeholder="e.g. Fashion, SaaS" /></div>
                <div><Label className="text-[12px]">Default landing page</Label><Input placeholder="https://" value={form.defaultLandingPage} onChange={(e) => set("defaultLandingPage")(e.target.value)} className="mt-1" /></div>
              </div>
            </div>
          </SectionCard>

          {analysis && (
            <SectionCard title="Website analysis">
              <div className="flex items-center gap-2 mb-2 text-[12px] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Growzzy read your real site — this context is attached to every campaign.
              </div>
              <div className="rounded-[10px] border border-border bg-background p-3.5 text-[12.5px] max-h-80 overflow-auto">
                <MessageResponse>{analysis}</MessageResponse>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Colors">
            <div className="flex flex-wrap gap-2">
              {palettes.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPalette(p)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                    palette.name === p.name ? "border-primary bg-primary-tint text-primary" : "border-border bg-background hover:border-primary/30",
                  )}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                  {p.name}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Voice & product">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Label className="text-[12px]">Tone of voice</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => set("tone")(t.value)}
                      className={cn(
                        "text-left rounded-[10px] border p-2.5 transition-colors",
                        form.tone === t.value ? "border-primary bg-primary-tint" : "border-border hover:border-primary/30",
                      )}
                    >
                      <div className="text-[12.5px] font-semibold">{t.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.sample}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="text-[12px]">Product description</Label>
                <Textarea
                  rows={3}
                  value={form.productDescription}
                  onChange={(e) => set("productDescription")(e.target.value)}
                  className="mt-1"
                  placeholder="What do you sell? Who's it for? What makes it different?"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-[12px]">Ideal customer</Label>
                <Input
                  value={form.audience}
                  onChange={(e) => set("audience")(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. Women 25–45 in Tier 1 India cities who shop online"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Live preview */}
        <aside className="sticky top-4">
          <SectionCard title="Live preview">
            <div className="rounded-[14px] border border-border overflow-hidden">
              <div className="h-16 flex items-center px-4 gap-3" style={{ background: palette.accent }}>
                <div className="h-8 w-8 rounded-lg grid place-items-center text-white font-bold text-[13px]" style={{ background: palette.primary }}>
                  {(form.businessName || "G").slice(0, 1).toUpperCase()}
                </div>
                <div className="text-[13.5px] font-semibold text-foreground">
                  {form.businessName || "Your brand"}
                </div>
              </div>
              <div className="p-4 bg-background">
                <div className="text-[11px] text-muted-foreground mb-1">Sponsored</div>
                <div className="text-[15px] font-medium leading-tight mb-1" style={{ color: palette.primary }}>
                  {form.businessName ? `${form.businessName} — ${tone.label} ad` : "Your headline appears here"}
                </div>
                <div className="text-[12.5px] text-foreground/80">
                  {form.productDescription || tone.sample}
                </div>
                <button
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
                  style={{ background: palette.primary }}
                >
                  <Sparkles className="h-3 w-3" />
                  Shop now
                </button>
              </div>
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-3">
              This is a live sample of how your ads will feel across Google & Meta.
            </p>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
