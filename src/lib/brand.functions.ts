import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnalyzedBrand } from "@/lib/brand-analysis.server";

const InputSchema = z.object({ url: z.string().min(3) });

export type { AnalyzedBrand };

/** Deeply analyses a real website + live competitor research into a brand profile. */
export const analyzeBrandSite = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");
    const { analyzeSite } = await import("@/lib/brand-analysis.server");
    return analyzeSite(apiKey, data.url);
  });
