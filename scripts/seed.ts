import "dotenv/config";
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { seedProducts } from "../src/data/products";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed Neon.");
  const rows = seedProducts.map((product) => ({
    ...product,
    compareAtPrice: product.compareAtPrice,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  }));
  const inserted = await db.insert(products).values(rows).onConflictDoNothing({ target: products.sku }).returning({ id: products.id });
  process.stdout.write(`Seed complete. Inserted ${inserted.length} products; existing SKUs were left unchanged.\n`);
  await db.$client.end();
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
