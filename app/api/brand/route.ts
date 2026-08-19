import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const USER_SCOPE = "preview-user";

export async function GET() {
  const [profile] = await db.select().from(brandProfiles).where(eq(brandProfiles.userId, USER_SCOPE)).limit(1);
  return NextResponse.json(profile ?? null);
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const [profile] = await db.insert(brandProfiles).values({
    userId: USER_SCOPE,
    businessName: payload.businessName ?? "",
    website: payload.website ?? "",
    audience: payload.audience ?? "",
    tone: payload.tone ?? "",
    payload,
  }).onConflictDoUpdate({
    target: brandProfiles.userId,
    set: {
      businessName: payload.businessName ?? "",
      website: payload.website ?? "",
      audience: payload.audience ?? "",
      tone: payload.tone ?? "",
      payload,
      updatedAt: new Date(),
    },
  }).returning();

  return NextResponse.json(profile);
}
