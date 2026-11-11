import { NextResponse } from "next/server";
import { productInputSchema } from "@/lib/validation";
import { deleteProduct, getProductById, updateProduct } from "@/lib/repositories/products";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const access = await requirePermission("products:read");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ data: product });
}

export async function PATCH(request: Request, context: Context) {
  const access = await requirePermission("products:write");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const { id } = await context.params;
  const parsed = productInputSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the product fields.", issues: parsed.error.flatten() }, { status: 422 });
  const product = await updateProduct(id, parsed.data);
  return product ? NextResponse.json({ data: product }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}

export async function DELETE(_request: Request, context: Context) {
  const access = await requirePermission("products:delete");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const { id } = await context.params;
  const deleted = await deleteProduct(id);
  return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
