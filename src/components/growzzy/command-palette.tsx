import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const nav = [
  { to: "/", label: "New Campaign" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ads", label: "Ads Manager" },
  { to: "/analytics", label: "Analytics" },
  { to: "/optimization", label: "AI Optimization" },
  { to: "/studio", label: "Ad Studio" },
  { to: "/projects", label: "Projects" },
  { to: "/brand", label: "My Brand" },
  { to: "/prompts", label: "Recent Prompts" },
  { to: "/settings/general", label: "Settings" },
];

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  return { open, setOpen };
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a section or search campaigns…" />
      <CommandList>
        <CommandEmpty>Nothing matches yet.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {nav.map((n) => (
            <CommandItem
              key={n.to}
              onSelect={() => {
                onOpenChange(false);
                router.push(n.to);
              }}
            >
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
