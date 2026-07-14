import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, CircleDashed, Sparkles, Users, Target, DollarSign, MapPin, Link as LinkIcon, Megaphone, ImageIcon, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [{ title: "New Campaign · Growzzy OS" }],
  }),
  component: NewCampaignPage,
});

const chipDefs = [
  { key: "objective", label: "Ad objective", icon: Target, regex: /(sell|lead|install|traffic|promot|launch|awareness|conversions?|sales)/i },
  { key: "audience", label: "Target audience", icon: Users, regex: /(women|men|female|male|founders?|parents?|students?|professionals?|customers?|shoppers?|buyers?|target(ing)?)/i },
  { key: "location", label: "Location", icon: MapPin, regex: /(in |india|us|uk|europe|city|cities|country|tier ?\d|worldwide|global)/i },
  { key: "budget", label: "Budget", icon: DollarSign, regex: /(\$|₹|budget|\/day|per day|daily)/i },
  { key: "landing", label: "Landing page", icon: LinkIcon, regex: /(https?:\/\/|www\.|\.com|\.io|\.ai|\.co)/i },
];

function NewCampaignPage() {
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("sales");
  const [landing, setLanding] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const flags = useMemo(() => {
    const combined = `${prompt} ${audience} ${location} ${budget} ${landing}`;
    return chipDefs.map((c) => ({ ...c, hit: c.regex.test(combined) }));
  }, [prompt, audience, location, budget, landing]);

  const build = async () => {
    if (!prompt.trim()) {
      toast.error("Tell Growzzy what you'd like to promote first.");
      return;
    }
    setBusy(true);
    try {
      const { campaignPlanId } = await endpoints.ai.build(prompt, {
        audience,
        location,
        dailyBudget: budget,
        goal,
        landingPage: landing,
      });
      toast.success("Plan ready — reviewing your campaign.");
      navigate({ to: "/builder/$planId", params: { planId: campaignPlanId } });
    } catch (e) {
      const msg = (e as { message?: string })?.message ?? "Couldn't reach Growzzy — try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-8">
      <div className="text-center mb-8">
        <h1 className="text-[36px] font-semibold tracking-tight text-foreground">
          Run ad campaigns in minutes.
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground max-w-xl mx-auto">
          Tell Growzzy what you want to promote. AI builds the strategy, targeting and ads for you.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        {[
          { icon: Megaphone, label: "Campaign", active: true },
          { icon: Target, label: "Boolean search" },
          { icon: ImageIcon, label: "Create Image" },
          { icon: Send, label: "Launch Ads" },
        ].map((t) => (
          <button
            key={t.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
              t.active
                ? "border-primary/20 bg-primary-tint text-primary"
                : "border-border bg-background text-foreground/70 hover:bg-muted",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="card-surface p-4 ring-1 ring-primary/10 shadow-sm">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="e.g. I want to sell women artificial jewellery on my Shopify store, target 30-50 women in India Tier 1 cities"
          className="border-0 shadow-none focus-visible:ring-0 text-[15px] resize-none p-2"
        />
        <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
          <div className="flex flex-wrap items-center gap-3">
            {flags.map((f) => (
              <span
                key={f.key}
                className={cn(
                  "inline-flex items-center gap-1 text-[12px] font-medium",
                  f.hit ? "text-success" : "text-muted-foreground",
                )}
              >
                {f.hit ? <Check className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
                {f.label}
              </span>
            ))}
          </div>
          <Button onClick={build} disabled={busy} className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            {busy ? "Building…" : "AI enhance & build plan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        <Input placeholder="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
        <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Input placeholder="Daily budget $" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <Select value={goal} onValueChange={setGoal}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="app_installs">App installs</SelectItem>
            <SelectItem value="traffic">Website traffic</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Landing page URL" value={landing} onChange={(e) => setLanding(e.target.value)} />
      </div>

      <p className="text-center text-[12px] text-muted-foreground mt-8">
        AI can make mistakes. Check important info before launching.
      </p>
    </div>
  );
}
