import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/repositories/orders";
import { orderInputSchema } from "@/lib/validation";
import { getCurrentUser, requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const access = await requirePermission("orders:read");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  try { return NextResponse.json({ data: await listOrders() }); }
  catch (error) { console.error("GET /api/orders", error); return NextResponse.json({ error: "Unable to load orders." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const parsed = orderInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check your checkout details.", issues: parsed.error.flatten() }, { status: 422 });
    const currentUser = process.env.DATA_MODE === "neon" ? await getCurrentUser() : null;
    const order = await createOrder({ ...parsed.data, userId: currentUser?.id });
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to place your order." }, { status: 409 });
  }
}
