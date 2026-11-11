import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { listCustomerOrders } from "@/lib/repositories/orders";

export const runtime = "nodejs";
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role === "customer" && process.env.DATA_MODE !== "neon") return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
  return NextResponse.json({ data: await listCustomerOrders(user.id) });
}
