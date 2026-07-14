import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in · Growzzy OS" }] }),
  component: () => (
    <div>
      <h1 className="text-[20px] font-semibold mb-1">Welcome back</h1>
      <p className="text-[13px] text-muted-foreground mb-5">Log in to your Growzzy workspace.</p>
      <div className="space-y-3">
        <div><Label>Email</Label><Input type="email" className="mt-1" /></div>
        <div><Label>Password</Label><Input type="password" className="mt-1" /></div>
        <Button className="w-full">Log in</Button>
      </div>
      <div className="flex justify-between text-[13px] mt-4">
        <Link to="/auth/forgot" className="text-primary">Forgot password?</Link>
        <Link to="/auth/signup" className="text-primary">Create account</Link>
      </div>
    </div>
  ),
});
