import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/server/auth";
import { updateSupportStatus } from "@/lib/repositories/support";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, context: Context) {
  const access = await requirePermission("support:write");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  const parsed = z.object({ status: z.string() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  try {
    const { id } = await context.params;
    const record = await updateSupportStatus(id, parsed.data.status);
    return record ? NextResponse.json({ data: record }) : NextResponse.json({ error: "Request not found." }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update request." }, { status: 422 }); }
}
