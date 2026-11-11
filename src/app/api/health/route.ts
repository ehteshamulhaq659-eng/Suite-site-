import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ status: "ok", app: "E&H Fabrics", dataMode: process.env.DATA_MODE === "neon" ? "neon" : "demo", timestamp: new Date().toISOString() });
}
