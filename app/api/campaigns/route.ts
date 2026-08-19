import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

const USER_SCOPE = "preview-user";

export async function GET() {
  const rows = await db.select().from(campaigns).where(eq(campaigns.userId, USER_SCOPE)).orderBy(desc(campaigns.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const payload = await request.json();
  const [campaign] = await db.insert(campaigns).values({
    userId: USER_SCOPE,
    projectId: payload.projectId ?? null,
    name: payload.name || "Untitled campaign",
    status: payload.status || "draft",
    objective: payload.objective || "",
    platform: payload.platform || "",
    budgetDaily: String(payload.budgetDaily || 0),
    currency: payload.currency || "USD",
    payload,
  }).returning();

  return NextResponse.json(campaign, { status: 201 });
}
