import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

async function getHandlers() {
  const { auth } = await import("@/lib/auth");
  return toNextJsHandler(auth);
}

function demoDisabled() {
  return NextResponse.json({ error: "Customer and staff accounts are enabled after connecting Neon. Demo mode does not persist authentication." }, { status: 503 });
}

export async function GET(request: Request) {
  if (process.env.DATA_MODE !== "neon") return demoDisabled();
  const handlers = await getHandlers();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  if (process.env.DATA_MODE !== "neon") return demoDisabled();
  const handlers = await getHandlers();
  return handlers.POST(request);
}
