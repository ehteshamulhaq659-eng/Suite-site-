import "server-only";

export type SupportRequestInput = {
  customerName: string; phone: string; email?: string; preferredColour?: string;
  fabricPreference?: string; budget?: number; description: string; referenceImageUrl?: string;
};

export type SupportRecord = SupportRequestInput & {
  id: string; requestNumber: string; status: string; createdAt: string;
};

const globalForSupport = globalThis as unknown as { ehDemoSupport?: SupportRecord[] };
const demoSupport = globalForSupport.ehDemoSupport ??= [
  { id: "demo-request-001", requestNumber: "EHF-R-001", customerName: "Mariam Ali", phone: "03xx-xxx-xxxx", preferredColour: "Bottle green", fabricPreference: "Lawn", budget: 3500, description: "Looking for a dark green embroidered suit similar to the reference collection.", status: "under_review", createdAt: "2026-11-10T14:00:00.000Z" },
];

export async function createSupportRequest(input: SupportRequestInput): Promise<SupportRecord> {
  const record: SupportRecord = {
    ...input, id: crypto.randomUUID(), requestNumber: `EHF-R-${Date.now().toString().slice(-6)}`,
    status: "new", createdAt: new Date().toISOString(),
  };
  if (process.env.DATA_MODE !== "neon") { demoSupport.unshift(record); return record; }
  const { db } = await import("@/db");
  const { supportRequests } = await import("@/db/schema");
  const [saved] = await db.insert(supportRequests).values({
    id: record.id, requestNumber: record.requestNumber, customerName: input.customerName, phone: input.phone,
    email: input.email || null, preferredColour: input.preferredColour || null, fabricPreference: input.fabricPreference || null,
    budget: input.budget ?? null, description: input.description, referenceImageUrl: input.referenceImageUrl || null,
    status: "new",
  }).returning();
  return { ...record, id: saved.id, createdAt: saved.createdAt.toISOString() };
}

export async function listSupportRequests(): Promise<SupportRecord[]> {
  if (process.env.DATA_MODE !== "neon") return [...demoSupport];
  const { db } = await import("@/db");
  const { supportRequests } = await import("@/db/schema");
  const { desc } = await import("drizzle-orm");
  const rows = await db.select().from(supportRequests).orderBy(desc(supportRequests.createdAt)).limit(100);
  return rows.map((row) => ({
    id: row.id, requestNumber: row.requestNumber, customerName: row.customerName, phone: row.phone,
    email: row.email ?? undefined, preferredColour: row.preferredColour ?? undefined,
    fabricPreference: row.fabricPreference ?? undefined, budget: row.budget ?? undefined,
    description: row.description, referenceImageUrl: row.referenceImageUrl ?? undefined,
    status: row.status, createdAt: row.createdAt.toISOString(),
  }));
}

export async function updateSupportStatus(id: string, status: string) {
  const allowed = ["new", "under_review", "matched", "quotation_sent", "completed", "closed"];
  if (!allowed.includes(status)) throw new Error("Invalid support status.");
  if (process.env.DATA_MODE !== "neon") {
    const record = demoSupport.find((request) => request.id === id);
    if (!record) return null;
    record.status = status;
    return record;
  }
  const { db } = await import("@/db");
  const { supportRequests } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const [record] = await db.update(supportRequests).set({ status, updatedAt: new Date() }).where(eq(supportRequests.id, id)).returning();
  return record ?? null;
}
