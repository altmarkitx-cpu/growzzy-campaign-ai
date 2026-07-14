import { createFileRoute } from "@tanstack/react-router";
import { SectionCard } from "@/components/growzzy/primitives";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/settings/danger")({
  component: () => (
    <SectionCard title="Danger zone" className="border-danger/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14px] font-semibold text-danger">Delete this account</div>
          <p className="text-[13px] text-muted-foreground">Permanently removes your workspace, campaigns, and history. Not reversible.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive">Delete account</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Growzzy account?</AlertDialogTitle>
              <AlertDialogDescription>This removes your workspace, all campaigns, prompts, and history. Google Ads campaigns already live are not affected.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-danger text-white hover:bg-danger/90">Yes, delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SectionCard>
  ),
});
