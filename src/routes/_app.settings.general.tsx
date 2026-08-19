import { createFileRoute } from "@tanstack/react-router";
import { SettingsPageHeader, SettingsSection } from "./_app.settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { loadUser, saveUser, emptyUser, type UserProfile } from "@/lib/user-store";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/settings/general")({
  component: GeneralSettings,
});

function GeneralSettings() {
  const [profile, setProfile] = useState<UserProfile>(emptyUser);
  const [form, setForm] = useState({
    workspaceName: "",
    website: "",
    goal: "sales",
    currency: "USD",
    timezone: "UTC",
    dailyCeiling: "",
    productDescription: "",
  });
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    saveUser(profile);
    setSaving(false);
    toast.success("Settings saved.");
  };

  return (
    <>
      <SettingsPageHeader
        title="General Settings"
        description="How Growzzy identifies you and your workspace across the platform."
        onSave={save}
        onDiscard={() => {
          setProfile(loadUser());
          toast("Changes discarded.");
        }}
        saving={saving}
      />

      <SettingsSection title="Your profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[12px]">Your name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="mt-1"
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label className="text-[12px]">Your email</Label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="mt-1"
              placeholder="you@company.com"
            />
          </div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Used to greet you in the AI campaign chat and in the sidebar.
        </p>
      </SettingsSection>

      <SettingsSection title="Workspace">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-[12px]">Workspace name</Label>
            <Input value={form.workspaceName} onChange={(e) => set("workspaceName")(e.target.value)} className="mt-1" placeholder="Growzzy" />
          </div>
          <div>
            <Label className="text-[12px]">Business website</Label>
            <Input value={form.website} onChange={(e) => set("website")(e.target.value)} className="mt-1" placeholder="https://" />
          </div>
          <div>
            <Label className="text-[12px]">Primary goal</Label>
            <Select value={form.goal} onValueChange={set("goal")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="app_installs">App installs</SelectItem>
                <SelectItem value="traffic">Website traffic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Currency</Label>
            <Select value={form.currency} onValueChange={set("currency")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD — US Dollar</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="GBP">GBP — Pound Sterling</SelectItem>
                <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                <SelectItem value="AUD">AUD — Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Timezone</Label>
            <Select value={form.timezone} onValueChange={set("timezone")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America / New York</SelectItem>
                <SelectItem value="America/Los_Angeles">America / Los Angeles</SelectItem>
                <SelectItem value="Europe/London">Europe / London</SelectItem>
                <SelectItem value="Asia/Kolkata">Asia / Kolkata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[12px]">Daily budget ceiling ($)</Label>
            <Input type="number" value={form.dailyCeiling} onChange={(e) => set("dailyCeiling")(e.target.value)} className="mt-1" placeholder="500" />
            <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-snug">
              Growzzy can never publish or shift budget beyond this per day — enforced automatically, not just a UI limit.
            </p>
          </div>
          <div className="md:col-span-2">
            <Label className="text-[12px]">Product description</Label>
            <Textarea rows={4} value={form.productDescription} onChange={(e) => set("productDescription")(e.target.value)} className="mt-1" placeholder="What do you sell? Who's it for? Growzzy uses this to write every ad." />
            <p className="text-[11.5px] text-muted-foreground mt-1.5">Same field as onboarding — edit any time.</p>
          </div>
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-[13px] font-semibold tracking-tight flex items-center gap-2 text-danger">
            <span>•</span> Danger zone
          </h2>
        </div>
        <div className="card-surface border-danger/30 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-danger-bg text-danger grid place-items-center shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">Delete account</div>
                <p className="text-[12.5px] text-muted-foreground mt-0.5 max-w-md">
                  Permanently deletes your account, campaigns, integrations, and all data. This cannot be undone.
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="shrink-0 rounded-[8px] bg-danger text-white px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-danger/90 transition-colors">
                  Delete account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your Growzzy workspace?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Type <span className="font-semibold text-foreground">{form.workspaceName || "your workspace name"}</span> below to confirm. All campaigns, prompts, and history will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Type workspace name to confirm"
                  className="mt-2"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirm("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={!form.workspaceName || confirm !== form.workspaceName}
                    className="bg-danger text-white hover:bg-danger/90"
                  >
                    Yes, delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </>
  );
}
