import { NextResponse } from "next/server";
import { listProducts } from "@/lib/repositories/products";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";

// Inventory staff receive only active catalogue rows needed to count and adjust stock.
export async function GET() {
  const access = await requirePermission("inventory:read");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  try {
    const products = await listProducts();
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("GET /api/inventory", error);
    return NextResponse.json({ error: "Unable to load inventory." }, { status: 500 });
  }
}
