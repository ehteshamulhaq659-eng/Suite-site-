import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminConsole } from "@/components/admin-console";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Store administration" };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "customer") redirect("/account?next=%2Fadmin");
  return <AdminConsole initialUser={{ id: user.id, name: user.name, email: user.email, role: user.role }} modeLabel={process.env.DATA_MODE === "neon" ? "NEON DATABASE" : "DEMO MODE"}/>;
}
