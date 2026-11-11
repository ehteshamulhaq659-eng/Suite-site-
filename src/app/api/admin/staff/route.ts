import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth";
import { z } from "zod";

export const runtime = "nodejs";
const roles = ["admin", "manager", "catalog", "orders", "support", "customer"] as const;
export async function GET() {
  const access = await requirePermission("staff:manage");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  if (process.env.DATA_MODE !== "neon") {
    return NextResponse.json({ data: [
      { id: "demo-admin", name: "E&H Administrator", email: "admin@ehfabrics.local", role: "admin" },
      { id: "demo-catalog", name: "Catalogue Team", email: "catalog@ehfabrics.local", role: "catalog" },
      { id: "demo-orders", name: "Order Desk", email: "orders@ehfabrics.local", role: "orders" },
    ] });
  }
  const { db } = await import("@/db");
  const { user } = await import("@/db/schema");
  const rows = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role }).from(user).limit(100);
  return NextResponse.json({ data: rows });
}
export async function PATCH(request: Request) {
  const access = await requirePermission("staff:manage");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const parsed = z.object({ userId: z.string().min(1), role: z.enum(roles) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Select a valid staff role." }, { status: 422 });
  if (process.env.DATA_MODE !== "neon") return NextResponse.json({ error: "Demo staff roles are examples. Connect Neon to persist role changes." }, { status: 409 });
  const { db } = await import("@/db");
  const { user } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  if (parsed.data.userId === access.user.id && parsed.data.role !== "admin") return NextResponse.json({ error: "You cannot remove your own administrator access." }, { status: 409 });
  const [updated] = await db.update(user).set({ role: parsed.data.role, updatedAt: new Date() }).where(eq(user.id, parsed.data.userId)).returning({ id: user.id, name: user.name, email: user.email, role: user.role });
  return updated ? NextResponse.json({ data: updated }) : NextResponse.json({ error: "User not found." }, { status: 404 });
}
