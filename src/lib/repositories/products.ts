import "server-only";
import { seedProducts, type Product } from "@/data/products";
import { slugify } from "@/lib/slug";

const globalForDemo = globalThis as unknown as { ehDemoProducts?: Product[] };
const demoProducts = globalForDemo.ehDemoProducts ??= structuredClone(seedProducts);

export type ProductInput = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt">;

function isNeon() { return process.env.DATA_MODE === "neon"; }

export async function listProducts(options: { includeDrafts?: boolean } = {}): Promise<Product[]> {
  if (!isNeon()) return demoProducts.filter((p) => options.includeDrafts || p.status === "active");
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema");
  const { desc, eq } = await import("drizzle-orm");
  const rows = options.includeDrafts
    ? await db.select().from(products).orderBy(desc(products.createdAt))
    : await db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt));
  return rows.map((p) => ({
    ...p,
    collection: p.collection ?? "",
    fabric: p.fabric ?? "",
    colour: p.colour ?? "",
    imageUrls: p.imageUrls ?? [],
    tags: p.tags ?? [],
    compareAtPrice: p.compareAtPrice ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    status: p.status as Product["status"],
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isNeon()) return demoProducts.find((p) => p.id === id) ?? null;
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return p ? {
    ...p,
    collection: p.collection ?? "",
    fabric: p.fabric ?? "",
    colour: p.colour ?? "",
    imageUrls: p.imageUrls ?? [],
    tags: p.tags ?? [],
    compareAtPrice: p.compareAtPrice ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    status: p.status as Product["status"],
  } : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isNeon()) return demoProducts.find((p) => p.slug === slug && p.status === "active") ?? null;
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema");
  const { and, eq } = await import("drizzle-orm");
  const [p] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.status, "active"))).limit(1);
  return p ? {
    ...p,
    collection: p.collection ?? "",
    fabric: p.fabric ?? "",
    colour: p.colour ?? "",
    imageUrls: p.imageUrls ?? [],
    tags: p.tags ?? [],
    compareAtPrice: p.compareAtPrice ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    status: p.status as Product["status"],
  } : null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const timestamp = new Date().toISOString();
  const product: Product = { ...input, id: crypto.randomUUID(), slug: `${slugify(input.name)}-${Math.random().toString(36).slice(2, 6)}`, createdAt: timestamp, updatedAt: timestamp };
  if (!isNeon()) { demoProducts.unshift(product); return product; }
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema");
  const [created] = await db.insert(products).values({ ...product, compareAtPrice: product.compareAtPrice ?? null, createdAt: new Date(timestamp), updatedAt: new Date(timestamp) }).returning();
  return {
    ...created,
    collection: created.collection ?? "",
    fabric: created.fabric ?? "",
    colour: created.colour ?? "",
    imageUrls: created.imageUrls ?? [],
    tags: created.tags ?? [],
    compareAtPrice: created.compareAtPrice ?? null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    status: created.status as Product["status"],
  };
}

export async function updateProduct(id: string, updates: Partial<ProductInput>): Promise<Product | null> {
  if (!isNeon()) {
    const index = demoProducts.findIndex((p) => p.id === id);
    if (index < 0) return null;
    demoProducts[index] = { ...demoProducts[index], ...updates, updatedAt: new Date().toISOString() };
    return demoProducts[index];
  }
  const { db } = await import("@/db");
  const { products, inventoryMovements } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  return db.transaction(async (tx) => {
    const [previous] = await tx.select().from(products).where(eq(products.id, id)).for("update");
    if (!previous) return null;
    const [updated] = await tx.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    if (!updated) return null;
    if (typeof updates.stock === "number" && updates.stock !== previous.stock) {
      await tx.insert(inventoryMovements).values({
        id: crypto.randomUUID(), productId: id, change: updates.stock - previous.stock,
        quantityAfter: updates.stock, reason: "Manual stock adjustment", referenceId: null,
      });
    }
    return {
      ...updated,
      collection: updated.collection ?? "",
      fabric: updated.fabric ?? "",
      colour: updated.colour ?? "",
      imageUrls: updated.imageUrls ?? [],
      tags: updated.tags ?? [],
      compareAtPrice: updated.compareAtPrice ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      status: updated.status as Product["status"],
    };
  });
}

export async function deleteProduct(id: string) {
  if (!isNeon()) {
    const index = demoProducts.findIndex((p) => p.id === id);
    if (index < 0) return false;
    demoProducts.splice(index, 1);
    return true;
  }
  const { db } = await import("@/db");
  const { products } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const rows = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
  return rows.length > 0;
}
