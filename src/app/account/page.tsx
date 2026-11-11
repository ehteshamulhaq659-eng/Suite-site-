import type { Metadata } from "next";
import { AccountClient } from "@/components/account-client";
export const metadata: Metadata = { title: "My account" };
export default function AccountPage() { return <AccountClient isDemo={process.env.DATA_MODE !== "neon"}/>; }
