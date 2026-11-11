import { NextResponse } from "next/server";
import { productInputSchema } from "@/lib/validation";
import { createProduct, listProducts } from "@/lib/repositories/products";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeDrafts = url.searchParams.get("includeDrafts") === "true";
    if (includeDrafts) {
      const access = await requirePermission("products:read");
      if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
    }
    const products = await listProducts({ includeDrafts });
    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("GET /api/products", error);
    return NextResponse.json({ error: "Unable to load products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const access = await requirePermission("products:write");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  try {
    const parsed = productInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check the product fields.", issues: parsed.error.flatten() }, { status: 422 });
    const product = await createProduct({ ...parsed.data, collection: parsed.data.collection || "", compareAtPrice: parsed.data.compareAtPrice ?? null });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create product." }, { status: 500 });
  }
}
