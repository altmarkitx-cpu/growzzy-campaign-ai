import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };
  const url = body.url?.trim();
  if (!url) return NextResponse.json({ error: "Website URL is required" }, { status: 400 });

  const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const hostname = new URL(normalized).hostname.replace(/^www\./, "");
  const businessName = hostname.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return NextResponse.json({
    site: normalized,
    profile: {
      businessName,
      industry: "",
      businessModel: "",
      whatTheySell: "",
      productDescription: "",
      positioning: "",
      differentiators: [],
      audience: "",
      segments: [],
      competitors: [],
      keywords: [],
      creativeAngles: [],
      tone: "",
      palette: { name: "Growzzy", primary: "#1F57F5", accent: "#EAF0FE" },
      defaultLandingPage: normalized,
      sources: [normalized],
    },
  });
}
