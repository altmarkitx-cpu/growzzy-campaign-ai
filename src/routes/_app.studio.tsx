import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard, EmptyState } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Image as ImageIcon, Check } from "lucide-react";

export const Route = createFileRoute("/_app/studio")({
  head: () => ({ meta: [{ title: "Ad Studio · Growzzy OS" }] }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <div>
      <PageHeader title="Ad Studio" subtitle="Generate ad copy and images that match your brand." />
      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard title="Describe the ad you want">
              <div className="inline-flex items-center gap-1 text-[12px] rounded-full bg-primary-tint text-primary px-2 py-0.5 mb-3">
                <Check className="h-3 w-3" /> Using My Brand
              </div>
              <Textarea rows={6} placeholder="e.g. A festive earrings ad for wedding shoppers — elegant, warm lighting, brand-safe copy." />
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Select defaultValue="search">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">Search ad</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="social">Social image</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="1:1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 square</SelectItem>
                    <SelectItem value="4:5">4:5 portrait</SelectItem>
                    <SelectItem value="16:9">16:9 landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-4 gap-1.5"><Sparkles className="h-4 w-4" />Generate</Button>
            </SectionCard>

            <SectionCard title="Preview">
              <EmptyState icon={<ImageIcon className="h-5 w-5" />} title="Your ad preview appears here" description="Generate to see live variants — Search shows a SERP mockup, Social shows a feed card." />
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <SectionCard>
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" />}
              title="Your library is empty"
              description="Saved creatives land here. Performance numbers show up once a creative runs in a live campaign."
            />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
