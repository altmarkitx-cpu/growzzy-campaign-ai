// Client-side brand store. Persists the workspace's brand context in the
// browser so the "My Brand" page, onboarding, and the AI campaign chat all
// share one source of truth — no backend required. This is what lets Growzzy
// actually know the business instead of asking "what do you sell?" every time.

import { useSyncExternalStore } from "react";

export interface BrandPalette {
  name: string;
  primary: string;
  accent: string;
}

export interface BrandContext {
  businessName: string;
  website: string;
  industry: string;
  tone: string;
  productDescription: string;
  defaultLandingPage: string;
  audience: string;
  /** From onboarding. */
  primaryGoal?: "sales" | "leads" | "app_installs" | "traffic";
  currency?: string;
  /** Selected brand palette. */
  palette?: BrandPalette;
  /** Cached AI analysis of the real website. */
  websiteAnalysis?: string;
  websiteAnalyzedAt?: string;
}

export const EMPTY_BRAND: BrandContext = {
  businessName: "",
  website: "",
  industry: "",
  tone: "friendly",
  productDescription: "",
  defaultLandingPage: "",
  audience: "",
  currency: "USD",
};

const KEY = "growzzy.brand.v1";

let current: BrandContext = load();
const listeners = new Set<() => void>();

function load(): BrandContext {
  if (typeof window === "undefined") return EMPTY_BRAND;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_BRAND;
    return { ...EMPTY_BRAND, ...(JSON.parse(raw) as Partial<BrandContext>) };
  } catch {
    return EMPTY_BRAND;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* storage full / unavailable — keep in-memory copy */
  }
}

export function getBrand(): BrandContext {
  return current;
}

export function setBrand(patch: Partial<BrandContext>) {
  current = { ...current, ...patch };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sync across tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = load();
      listener();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** React hook — re-renders when the brand changes anywhere in the app. */
export function useBrand(): BrandContext {
  return useSyncExternalStore(subscribe, getBrand, () => EMPTY_BRAND);
}

/** True when the user has entered enough for Growzzy to skip the basics. */
export function hasBrandContext(b: BrandContext): boolean {
  return Boolean(b.businessName?.trim() || b.productDescription?.trim() || b.website?.trim());
}

const GOAL_LABEL: Record<NonNullable<BrandContext["primaryGoal"]>, string> = {
  sales: "Sales / purchases",
  leads: "Leads",
  app_installs: "App installs",
  traffic: "Website traffic",
};

/**
 * Compact, model-friendly description of the brand. Injected into the chat
 * system prompt so the agent already knows the business.
 */
export function brandToPromptContext(b: BrandContext): string | null {
  if (!hasBrandContext(b)) return null;
  const lines: string[] = [];
  if (b.businessName?.trim()) lines.push(`Business name: ${b.businessName.trim()}`);
  if (b.industry?.trim()) lines.push(`Industry: ${b.industry.trim()}`);
  if (b.website?.trim()) lines.push(`Website: ${b.website.trim()}`);
  if (b.productDescription?.trim()) lines.push(`What they sell: ${b.productDescription.trim()}`);
  if (b.audience?.trim()) lines.push(`Ideal customer: ${b.audience.trim()}`);
  if (b.tone?.trim()) lines.push(`Brand tone of voice: ${b.tone.trim()}`);
  if (b.primaryGoal) lines.push(`Primary goal: ${GOAL_LABEL[b.primaryGoal]}`);
  if (b.currency?.trim()) lines.push(`Currency: ${b.currency.trim()}`);
  if (b.defaultLandingPage?.trim()) lines.push(`Default landing page: ${b.defaultLandingPage.trim()}`);
  if (b.websiteAnalysis?.trim()) {
    lines.push(`\nDeep website analysis (from a real fetch of their site):\n${b.websiteAnalysis.trim()}`);
  }
  return lines.join("\n");
}
