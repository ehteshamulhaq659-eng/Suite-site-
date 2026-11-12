import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { v2 as cloudinary } from "cloudinary";
import * as schema from "../src/db/schema";
import { categories, collections, products, storeSettings } from "../src/db/schema";
import { seedCategories, seedCollections, seedProducts } from "../src/data/products";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required. Add your Neon connection string to .env before seeding.");
}

const cloudinaryValues = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
];
const cloudinaryConfigured = cloudinaryValues.every((value) => Boolean(value?.trim()));
const cloudinaryPartiallyConfigured = cloudinaryValues.some((value) => Boolean(value?.trim())) && !cloudinaryConfigured;
if (cloudinaryPartiallyConfigured) {
  throw new Error("Cloudinary is only partially configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or remove all three to keep the repository's static image URLs.");
}
if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const pool = new Pool({ connectionString, max: 3, connectionTimeoutMillis: 10_000 });
const db = drizzle({ client: pool, schema });

async function resolveImageUrl(url: string): Promise<string> {
  if (!url.startsWith("/suits/") && !url.startsWith("/products/")) return url;
  const localPath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  if (!existsSync(localPath)) throw new Error(`Product image is missing from the project: ${localPath}`);
  if (!cloudinaryConfigured) return url;
  const publicId = `eh-fabrics/products/${path.parse(url).name}`;
  try {
    const existing = await cloudinary.api.resource(publicId, { resource_type: "image" });
    return existing.secure_url;
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("http_code" in error) ||
      error.http_code !== 404
    ) {
      throw error;
    }
  }
  const uploaded = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
    use_filename: false,
  });
  return uploaded.secure_url;
}

async function main() {
  const now = new Date();
  const existingProducts = await db.select({ sku: products.sku }).from(products)
    .where(inArray(products.sku, seedProducts.map((product) => product.sku)));
  const existingSkus = new Set(existingProducts.map((product) => product.sku));
  const productsToInsert = seedProducts.filter((product) => !existingSkus.has(product.sku));
  const imageMap = new Map<string, string>();
  const allImagePaths = [...new Set(productsToInsert.flatMap((product) => product.imageUrls))];

  for (const imagePath of allImagePaths) {
    imageMap.set(imagePath, await resolveImageUrl(imagePath));
  }

  for (const category of seedCategories) {
    await db.insert(categories).values({ ...category, createdAt: now, updatedAt: now }).onConflictDoNothing();
  }

  for (const collection of seedCollections) {
    await db.insert(collections).values({
      ...collection,
      coverImage: imageMap.get(collection.coverImage) ?? collection.coverImage,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoNothing();
  }

  const productRows = productsToInsert.map((product) => ({
    ...product,
    imageUrls: product.imageUrls.map((url) => imageMap.get(url) ?? url),
    createdAt: new Date(product.createdAt),
    updatedAt: now,
  }));
  const inserted = productRows.length > 0
    ? await db.insert(products).values(productRows).onConflictDoNothing().returning({ sku: products.sku })
    : [];

  const defaultSettings = [
    { key: "deliveryFee", value: Math.max(0, Number(process.env.DEFAULT_DELIVERY_FEE ?? 250)) },
    { key: "freeDeliveryThreshold", value: Math.max(0, Number(process.env.FREE_DELIVERY_THRESHOLD ?? 0)) },
    { key: "whatsappNumber", value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "" },
    { key: "storeEmail", value: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "" },
    { key: "storePhone", value: process.env.NEXT_PUBLIC_STORE_PHONE ?? "" },
    { key: "bankTransferInstructions", value: "Our team will share the bank transfer details when confirming your order." },
  ];
  for (const setting of defaultSettings) {
    await db.insert(storeSettings).values({ ...setting, updatedAt: now }).onConflictDoNothing({ target: storeSettings.key });
  }

  const storageMode = cloudinaryConfigured ? "Cloudinary URLs" : "local /suits URLs";
  process.stdout.write(
    `Catalogue import complete. ${inserted.length} products inserted; ${seedProducts.length - inserted.length} existing products left unchanged. ${seedCategories.length} categories and ${seedCollections.length} collections checked. Images use ${storageMode}.\n` +
    "Inventory is unverified and remains at zero; update confirmed quantities in Admin → Products before accepting orders.\n",
  );
}

main()
  .catch((error) => {
    console.error("Catalogue seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
