import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Sign up · Growzzy OS" }] }),
  component: () => (
    <div>
      <h1 className="text-[20px] font-semibold mb-1">Create your workspace</h1>
      <p className="text-[13px] text-muted-foreground mb-5">Free to start. Connect Google Ads whenever you're ready.</p>
      <div className="space-y-3">
        <div><Label>Name</Label><Input className="mt-1" /></div>
        <div><Label>Work email</Label><Input type="email" className="mt-1" /></div>
        <div><Label>Password</Label><Input type="password" className="mt-1" /></div>
        <Button className="w-full">Create account</Button>
      </div>
      <div className="text-[13px] mt-4 text-center">
        Already have an account? <Link to="/auth/login" className="text-primary">Log in</Link>
      </div>
    </div>
  ),
});
