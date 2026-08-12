import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Sparkles, Check, Globe, Loader2, ExternalLink, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { analyzeBrandSite } from "@/lib/brand.functions";
import {
  loadBrand,
  saveBrand,
  brandIsReady,
  emptyBrand,
  type BrandProfile,
} from "@/lib/brand-store";

export const Route = createFileRoute("/_app/brand")({
  head: () => ({
    meta: [
      { title: "My Brand · Growzzy OS" },
      {
        name: "description",
        content:
          "Add your website once — Growzzy analyses your business, offer, audience and competitors, then uses it in every campaign.",
      },
      { property: "og:title", content: "My Brand · Growzzy OS" },
      {
        property: "og:description",
        content:
          "Your brand context: offer, audience, competitors and keywords, analysed from your live website.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandPage,
});

const palettes = [
  { name: "Growzzy", primary: "#1F57F5", accent: "#EAF0FE" },
  { name: "Ember", primary: "#F97316", accent: "#FEF0E6" },
  { name: "Forest", primary: "#059669", accent: "#E7F5EF" },
  { name: "Rose", primary: "#E11D48", accent: "#FCE7EC" },
  { name: "Slate", primary: "#0F172A", accent: "#E9EBEF" },
];

const tones = [
  { value: "friendly", label: "Friendly", sample: "Hey! Grab yours before they're gone ✨" },
  {
    value: "professional",
    label: "Professional",
    sample: "Trusted by 10,000+ businesses worldwide.",
  },
  { value: "playful", label: "Playful", sample: "Warning: dangerously good products inside 💎" },
  { value: "premium", label: "Premium", sample: "Crafted for those who notice the details." },
];

/** Editable list of short strings, rendered as removable chips. */
function ChipEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11.5px] text-foreground"
          >
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => onChange(items.filter((x) => x !== t))}
              className="text-muted-foreground hover:text-danger"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-8 text-[12.5px]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="h-8 shrink-0 gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}

function BrandPage() {
  const [brand, setBrand] = useState<BrandProfile>(emptyBrand);
  const [urlInput, setUrlInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const analyze = useServerFn(analyzeBrandSite);

  useEffect(() => {
    const loaded = loadBrand();
    setBrand(loaded);
    setUrlInput(loaded.website);
  }, []);

  const set =
    <K extends keyof BrandProfile>(k: K) =>
    (v: BrandProfile[K]) =>
      setBrand((b) => ({ ...b, [k]: v }));

  const ready = brandIsReady(brand);

  const runAnalysis = async () => {
    if (!urlInput.trim()) {
      toast.error("Add your website URL first.");
      return;
    }
    setAnalyzing(true);
    try {
      const { site, profile } = await analyze({ data: { url: urlInput.trim() } });
      const next: BrandProfile = {
        ...brand,
        website: site,
        defaultLandingPage: brand.defaultLandingPage || site,
        businessName: profile.businessName,
        industry: profile.industry,
        businessModel: profile.businessModel,
        whatTheySell: profile.whatTheySell,
        productDescription: profile.productDescription,
        positioning: profile.positioning,
        differentiators: profile.differentiators,
        audience: profile.audience,
        segments: profile.segments,
        competitors: profile.competitors,
        keywords: profile.keywords,
        creativeAngles: profile.creativeAngles,
        tone: profile.tone || brand.tone,
        analyzedAt: new Date().toISOString(),
        sources: profile.sources,
      };
      setBrand(next);
      saveBrand(next);
      toast.success(`Analysed ${profile.businessName}. Growzzy now knows your business.`);
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Couldn't analyse that website.");
    } finally {
      setAnalyzing(false);
    }
  };

  const save = () => {
    saveBrand(brand);
    toast.success("Brand context saved. Growzzy uses it on every campaign.");
  };

  const tone = tones.find((t) => t.value === brand.tone) ?? tones[0];
  const palette = palettes.find((p) => p.name === brand.palette.name) ?? palettes[0];

  return (
    <div>
      <PageHeader
        title="My Brand"
        subtitle="Growzzy reads your live website so it never has to ask what your business is."
        actions={
          <Button onClick={save} className="gap-1.5">
            <Check className="h-4 w-4" />
            Save brand context
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <SectionCard title="Website analysis">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label className="text-[12px]">Your website URL</Label>
                <div className="relative mt-1">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="yourbrand.com"
                    className="pl-8"
                  />
                </div>
              </div>
              <Button onClick={runAnalysis} disabled={analyzing} className="gap-1.5">
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {analyzing ? "Analysing your business…" : "Deep-analyse my business"}
              </Button>
            </div>
            <p className="mt-2 text-[11.5px] leading-snug text-muted-foreground">
              Growzzy reads your real pages, searches the live web for your category and
              competitors, then builds the brand context every campaign is written from.
            </p>
            {!ready && !analyzing && (
              <div className="mt-3 rounded-[10px] border border-border bg-warn-bg/50 p-3 text-[12.5px] text-foreground">
                Brand context is empty — the AI will keep asking you to set this up until it's
                filled.
              </div>
            )}
            {brand.analyzedAt && (
              <div className="mt-3 text-[11.5px] text-muted-foreground">
                Last analysed {new Date(brand.analyzedAt).toLocaleString()}
                {brand.sources?.length ? ` · ${brand.sources.length} live sources read` : ""}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Business">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-[12px]">Business name</Label>
                <Input
                  value={brand.businessName}
                  onChange={(e) => set("businessName")(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[12px]">Industry</Label>
                <Input
                  value={brand.industry}
                  onChange={(e) => set("industry")(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-[12px]">Business model</Label>
                <Input
                  value={brand.businessModel}
                  onChange={(e) => set("businessModel")(e.target.value)}
                  className="mt-1"
                  placeholder="e.g. D2C ecommerce, B2B SaaS"
                />
              </div>
              <div>
                <Label className="text-[12px]">Default landing page</Label>
                <Input
                  value={brand.defaultLandingPage}
                  onChange={(e) => set("defaultLandingPage")(e.target.value)}
                  className="mt-1"
                  placeholder="https://"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[12px]">What you sell</Label>
                <Textarea
                  rows={2}
                  value={brand.whatTheySell}
                  onChange={(e) => set("whatTheySell")(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[12px]">Product description</Label>
                <Textarea
                  rows={3}
                  value={brand.productDescription}
                  onChange={(e) => set("productDescription")(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[12px]">Positioning</Label>
                <Textarea
                  rows={2}
                  value={brand.positioning}
                  onChange={(e) => set("positioning")(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[12px]">Ideal customer</Label>
                <Input
                  value={brand.audience}
                  onChange={(e) => set("audience")(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1.5 text-[12px] font-medium text-foreground">Differentiators</div>
              <ChipEditor
                items={brand.differentiators}
                onChange={set("differentiators")}
                placeholder="Add a differentiator and press Enter"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Audience segments"
            action={
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  set("segments")([...brand.segments, { segment: "", pains: "", triggers: "" }])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add segment
              </Button>
            }
          >
            {brand.segments.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">
                No segments yet — analyse your website or add one manually.
              </p>
            ) : (
              <div className="space-y-2.5">
                {brand.segments.map((seg, i) => (
                  <div key={i} className="rounded-[10px] border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={seg.segment}
                        onChange={(e) =>
                          set("segments")(
                            brand.segments.map((x, xi) =>
                              xi === i ? { ...x, segment: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Segment name"
                        className="h-8 text-[12.5px] font-medium"
                      />
                      <button
                        type="button"
                        aria-label="Remove segment"
                        onClick={() => set("segments")(brand.segments.filter((_, xi) => xi !== i))}
                        className="shrink-0 text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Textarea
                      rows={2}
                      value={seg.pains}
                      onChange={(e) =>
                        set("segments")(
                          brand.segments.map((x, xi) =>
                            xi === i ? { ...x, pains: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="Pains"
                      className="mt-2 text-[12.5px]"
                    />
                    <Textarea
                      rows={2}
                      value={seg.triggers}
                      onChange={(e) =>
                        set("segments")(
                          brand.segments.map((x, xi) =>
                            xi === i ? { ...x, triggers: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="Buying triggers"
                      className="mt-2 text-[12.5px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Competitors"
            action={
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  set("competitors")([...brand.competitors, { name: "", url: "", angle: "" }])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add competitor
              </Button>
            }
          >
            {brand.competitors.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">
                No competitors yet — analyse your website or add one manually.
              </p>
            ) : (
              <div className="space-y-2">
                {brand.competitors.map((c, i) => (
                  <div key={i} className="rounded-[10px] border border-border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={c.name}
                        onChange={(e) =>
                          set("competitors")(
                            brand.competitors.map((x, xi) =>
                              xi === i ? { ...x, name: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Competitor name"
                        className="h-8 text-[12.5px] font-medium"
                      />
                      <Input
                        value={c.url}
                        onChange={(e) =>
                          set("competitors")(
                            brand.competitors.map((x, xi) =>
                              xi === i ? { ...x, url: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="https://"
                        className="h-8 text-[12.5px]"
                      />
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="shrink-0 text-primary"
                          aria-label={`Visit ${c.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        aria-label="Remove competitor"
                        onClick={() =>
                          set("competitors")(brand.competitors.filter((_, xi) => xi !== i))
                        }
                        className="shrink-0 text-muted-foreground hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Textarea
                      rows={2}
                      value={c.angle}
                      onChange={(e) =>
                        set("competitors")(
                          brand.competitors.map((x, xi) =>
                            xi === i ? { ...x, angle: e.target.value } : x,
                          ),
                        )
                      }
                      placeholder="Their angle / how they position"
                      className="mt-2 text-[12.5px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Search & creative signals">
            <div>
              <div className="mb-1.5 text-[12px] font-medium text-foreground">
                High-intent keywords
              </div>
              <ChipEditor
                items={brand.keywords}
                onChange={set("keywords")}
                placeholder="Add a keyword and press Enter"
              />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 text-[12px] font-medium text-foreground">Creative angles</div>
              <ChipEditor
                items={brand.creativeAngles}
                onChange={set("creativeAngles")}
                placeholder="Add a creative angle and press Enter"
              />
            </div>
          </SectionCard>

          <SectionCard title="Voice & colors">
            <Label className="text-[12px]">Tone of voice</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => set("tone")(t.value)}
                  className={cn(
                    "rounded-[10px] border p-2.5 text-left transition-colors",
                    brand.tone === t.value
                      ? "border-primary bg-primary-tint"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <div className="text-[12.5px] font-semibold">{t.label}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {t.sample}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {palettes.map((p) => (
                <button
                  key={p.name}
                  onClick={() => set("palette")(p)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                    palette.name === p.name
                      ? "border-primary bg-primary-tint text-primary"
                      : "border-border bg-background hover:border-primary/30",
                  )}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                  {p.name}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="sticky top-4">
          <SectionCard title="Live preview">
            <div className="overflow-hidden rounded-[14px] border border-border">
              <div
                className="flex h-16 items-center gap-3 px-4"
                style={{ background: palette.accent }}
              >
                <div
                  className="grid h-8 w-8 place-items-center rounded-lg text-[13px] font-bold text-white"
                  style={{ background: palette.primary }}
                >
                  {(brand.businessName || "G").slice(0, 1).toUpperCase()}
                </div>
                <div className="text-[13.5px] font-semibold text-foreground">
                  {brand.businessName || "Your brand"}
                </div>
              </div>
              <div className="bg-background p-4">
                <div className="mb-1 text-[11px] text-muted-foreground">Sponsored</div>
                <div
                  className="mb-1 text-[15px] font-medium leading-tight"
                  style={{ color: palette.primary }}
                >
                  {brand.businessName
                    ? `${brand.businessName} — ${tone.label} ad`
                    : "Your headline appears here"}
                </div>
                <div className="text-[12.5px] text-foreground/80">
                  {brand.productDescription || tone.sample}
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
            <p className="mt-3 text-[11.5px] text-muted-foreground">
              Growzzy only advertises on Google Ads and Meta Ads — this is how your ads will feel.
            </p>
          </SectionCard>

          {brand.sources?.length ? (
            <SectionCard title="Sources read" className="mt-4">
              <ul className="space-y-1">
                {brand.sources.slice(0, 10).map((s) => (
                  <li key={s} className="truncate text-[11.5px]">
                    <a
                      href={s}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary hover:underline"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
