import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/growzzy/primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/settings/general")({
  component: () => (
    <SectionCard title="Workspace">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Workspace name</Label><Input className="mt-1" /></div>
        <div><Label>Currency</Label>
          <Select defaultValue="USD">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Timezone</Label>
          <Select defaultValue="UTC">
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="UTC">UTC</SelectItem><SelectItem value="America/New_York">New York</SelectItem><SelectItem value="Asia/Kolkata">India</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Daily budget ceiling ($)</Label><Input type="number" className="mt-1" /></div>
        <div className="md:col-span-2"><Label>Product description</Label><Textarea rows={4} className="mt-1" /></div>
      </div>
      <Button className="mt-4">Save changes</Button>
    </SectionCard>
  ),
});
