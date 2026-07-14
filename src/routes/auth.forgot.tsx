import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Reset password · Growzzy OS" }] }),
  component: () => (
    <div>
      <h1 className="text-[20px] font-semibold mb-1">Reset your password</h1>
      <p className="text-[13px] text-muted-foreground mb-5">We'll email you a link to set a new one.</p>
      <div className="space-y-3">
        <div><Label>Email</Label><Input type="email" className="mt-1" /></div>
        <Button className="w-full">Send reset link</Button>
      </div>
      <div className="text-[13px] mt-4 text-center">
        <Link to="/auth/login" className="text-primary">Back to log in</Link>
      </div>
    </div>
  ),
});
