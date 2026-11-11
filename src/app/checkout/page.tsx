import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { getStoreSettings } from "@/lib/repositories/settings";
export const metadata: Metadata = { title: "Checkout" };
export default async function CheckoutPage() { const settings = await getStoreSettings(); return <CheckoutClient settings={settings} />; }
