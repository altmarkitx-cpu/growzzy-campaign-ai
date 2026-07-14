import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { endpoints } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome to Growzzy · Set up your workspace" }] }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const [step, setStep] = useState(2);
  const [googleState, setGoogleState] = useState<"idle" | "connecting" | "syncing" | "connected">("idle");
  const navigate = useNavigate();

  const connectGoogle = async () => {
    setGoogleState("connecting");
    try {
      const { url } = await endpoints.integrations.googleConnectUrl();
      window.location.href = url;
    } catch {
      toast.error("Couldn't reach Google Ads — try again.");
      setGoogleState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-[8px] bg-primary text-primary-foreground grid place-items-center font-bold">G</div>
          <span className="text-[18px] font-semibold">Growzzy</span>
        </div>

        <h1 className="text-[28px] font-semibold mb-2">Let's get you set up</h1>
        <p className="text-[15px] text-muted-foreground mb-8">Three quick steps and you'll be launching your first campaign.</p>

        <div className="space-y-3">
          <StepPill index={1} title="Create your identity" done>
            <div className="text-[13px] text-muted-foreground">Anand Maximizze · anand@example.com · Authenticated ✓</div>
          </StepPill>

          <StepPill index={2} title="Configure your workspace" active={step === 2} onOpen={() => setStep(2)} done={step > 2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div><Label>Business name</Label><Input className="mt-1" /></div>
              <div><Label>Website URL</Label><Input placeholder="https://" className="mt-1" /></div>
              <div className="md:col-span-2">
                <Label>Primary goal</Label>
                <RadioGroup defaultValue="sales" className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[["sales","Sales"],["leads","Leads"],["installs","App installs"],["traffic","Traffic"]].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 rounded-[10px] border border-border px-3 py-2 cursor-pointer has-[:checked]:bg-primary-tint has-[:checked]:border-primary/30">
                      <RadioGroupItem value={v} /><span className="text-[13px]">{l}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div><Label>Currency</Label>
                <Select defaultValue="USD"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent></Select>
              </div>
              <div><Label>Timezone</Label>
                <Select defaultValue="UTC"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UTC">UTC</SelectItem><SelectItem value="America/New_York">New York</SelectItem></SelectContent></Select>
              </div>
              <div className="md:col-span-2">
                <Label>Daily budget ceiling ($)</Label>
                <Input type="number" className="mt-1" />
                <p className="text-[12px] text-muted-foreground mt-1">Growzzy can never spend more than this per day — enforced automatically.</p>
              </div>
              <div className="md:col-span-2">
                <Label>Short product description</Label>
                <Textarea rows={3} className="mt-1" placeholder="Used by the AI to write your campaigns" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </div>
          </StepPill>

          <StepPill index={3} title="Connect your advertising" active={step === 3} onOpen={() => setStep(3)}>
            <div className="space-y-3 pt-2">
              <div className="rounded-[10px] border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold">Google Ads</div>
                  <p className="text-[12px] text-muted-foreground">
                    {googleState === "syncing" ? "Connected ✓ — syncing your account…" : "Connect your Google Ads account."}
                  </p>
                </div>
                {googleState === "connected" ? <Check className="h-5 w-5 text-success" /> : <Button onClick={connectGoogle} disabled={googleState === "connecting"}>{googleState === "connecting" ? "Redirecting…" : "Connect"}</Button>}
              </div>

              <div className="rounded-[10px] border border-border p-4 flex items-center justify-between opacity-70">
                <div>
                  <div className="text-[14px] font-semibold">Meta Ads</div>
                  <p className="text-[12px] text-muted-foreground">Coming soon — Google is fully supported today.</p>
                </div>
                <Button disabled variant="outline">Coming soon</Button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={() => navigate({ to: "/" })}>I'll connect later</Button>
                <Button onClick={() => navigate({ to: "/" })}>Create your first campaign</Button>
              </div>
            </div>
          </StepPill>
        </div>
      </div>
    </div>
  );
}

function StepPill({ index, title, active, done, children, onOpen }: { index: number; title: string; active?: boolean; done?: boolean; children: React.ReactNode; onOpen?: () => void }) {
  const expanded = active;
  return (
    <div className={cn("card-surface overflow-hidden transition-all", active && "ring-2 ring-primary/20")}>
      <button type="button" onClick={onOpen} className="w-full flex items-center gap-3 p-4 text-left">
        <span className={cn("h-7 w-7 rounded-full grid place-items-center text-[12px] font-bold", done ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground")}>
          {done ? <Check className="h-4 w-4" /> : index}
        </span>
        <span className={cn("flex-1 text-[15px] font-semibold", done && "text-muted-foreground")}>{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
