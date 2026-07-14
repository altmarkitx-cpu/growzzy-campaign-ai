import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-[8px] bg-primary text-primary-foreground grid place-items-center font-bold">G</div>
          <span className="text-[18px] font-semibold">Growzzy</span>
        </div>
        <div className="card-surface p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
