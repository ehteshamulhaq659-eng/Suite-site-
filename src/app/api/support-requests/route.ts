import { NextResponse } from "next/server";
import { supportRequestInputSchema } from "@/lib/validation";
import { createSupportRequest, listSupportRequests } from "@/lib/repositories/support";
import { requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const access = await requirePermission("support:read");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  return NextResponse.json({ data: await listSupportRequests() });
}

export async function POST(request: Request) {
  try {
    const parsed = supportRequestInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please check the request details.", issues: parsed.error.flatten() }, { status: 422 });
    const record = await createSupportRequest(parsed.data);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.error("POST /api/support-requests", error);
    return NextResponse.json({ error: "Unable to submit your request right now." }, { status: 500 });
  }
}
