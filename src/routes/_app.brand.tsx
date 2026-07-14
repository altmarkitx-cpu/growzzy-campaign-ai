import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endpoints } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_app/brand")({
  head: () => ({ meta: [{ title: "My Brand · Growzzy OS" }] }),
  component: BrandPage,
});

function BrandPage() {
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    industry: "",
    tone: "friendly",
    productDescription: "",
    defaultLandingPage: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await endpoints.workspace.updateBrand(form);
      toast.success("Brand kit saved.");
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? "Couldn't save right now.");
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader
        title="My Brand"
        subtitle="Every campaign Growzzy writes uses this."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Business" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Business name</Label><Input value={form.businessName} onChange={(e) => set("businessName")(e.target.value)} className="mt-1" /></div>
            <div><Label>Website</Label><Input placeholder="https://" value={form.website} onChange={(e) => set("website")(e.target.value)} className="mt-1" /></div>
            <div><Label>Industry</Label><Input value={form.industry} onChange={(e) => set("industry")(e.target.value)} className="mt-1" /></div>
            <div><Label>Tone of voice</Label>
              <Select value={form.tone} onValueChange={set("tone")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>Product description</Label><Textarea rows={4} value={form.productDescription} onChange={(e) => set("productDescription")(e.target.value)} className="mt-1" /></div>
            <div className="md:col-span-2"><Label>Default landing page</Label><Input placeholder="https://" value={form.defaultLandingPage} onChange={(e) => set("defaultLandingPage")(e.target.value)} className="mt-1" /></div>
          </div>
        </SectionCard>

        <SectionCard title="Logo">
          <div className="aspect-square rounded-[10px] border-2 border-dashed border-border grid place-items-center text-[13px] text-muted-foreground text-center p-4">
            Drop your logo here<br />or click to upload
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
