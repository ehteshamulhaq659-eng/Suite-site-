import { NextResponse } from "next/server";
import { z } from "zod";
import { getStoreSettings, updateStoreSettings } from "@/lib/repositories/settings";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";
const settingsSchema = z.object({
  deliveryFee: z.number().int().min(0).max(100_000),
  freeDeliveryThreshold: z.number().int().min(0).max(10_000_000),
  whatsappNumber: z.string().max(32),
  storeEmail: z.string().max(254).refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address."),
  storePhone: z.string().max(32),
  bankTransferInstructions: z.string().max(1500),
});
export async function GET() {
  const access = await requirePermission("settings:manage");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  return NextResponse.json({ data: await getStoreSettings() });
}
export async function PUT(request: Request) {
  const access = await requirePermission("settings:manage");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the store settings.", issues: parsed.error.flatten() }, { status: 422 });
  return NextResponse.json({ data: await updateStoreSettings(parsed.data) });
}
