import "server-only";

export type StoreSettings = {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  whatsappNumber: string;
  storeEmail: string;
  storePhone: string;
  bankTransferInstructions: string;
};

const defaults: StoreSettings = {
  deliveryFee: Math.max(0, Number(process.env.DEFAULT_DELIVERY_FEE ?? 250)),
  freeDeliveryThreshold: Math.max(0, Number(process.env.FREE_DELIVERY_THRESHOLD ?? 0)),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  storeEmail: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
  storePhone: process.env.NEXT_PUBLIC_STORE_PHONE ?? "",
  bankTransferInstructions: "Our team will share the bank transfer details when confirming your order.",
};
const globalForSettings = globalThis as unknown as { ehDemoSettings?: StoreSettings };
const demoSettings = globalForSettings.ehDemoSettings ??= { ...defaults };

export async function getStoreSettings(): Promise<StoreSettings> {
  if (process.env.DATA_MODE !== "neon") return { ...demoSettings };
  const { db } = await import("@/db");
  const { storeSettings } = await import("@/db/schema");
  const rows = await db.select().from(storeSettings);
  const saved = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Partial<StoreSettings>;
  return { ...defaults, ...saved };
}

export async function updateStoreSettings(input: Partial<StoreSettings>) {
  const next = { ...(await getStoreSettings()), ...input };
  if (process.env.DATA_MODE !== "neon") {
    Object.assign(demoSettings, next);
    return { ...demoSettings };
  }
  const { db } = await import("@/db");
  const { storeSettings } = await import("@/db/schema");
  for (const [key, value] of Object.entries(next)) {
    await db.insert(storeSettings).values({ key, value, updatedAt: new Date() }).onConflictDoUpdate({ target: storeSettings.key, set: { value, updatedAt: new Date() } });
  }
  return next;
}
