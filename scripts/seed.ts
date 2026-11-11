import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
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
const uploadedImages = new Map<string, string>();
let canUploadToCloudinary = cloudinaryConfigured;

async function resolveImageUrl(url: string): Promise<string> {
  if (!url.startsWith("/products/")) return url;
  const localPath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  if (!existsSync(localPath)) throw new Error(`Product image is missing from the project: ${localPath}`);
  if (!canUploadToCloudinary) return url;
  const cached = uploadedImages.get(url);
  if (cached) return cached;

  try {
    const publicId = path.parse(url).name;
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "eh-fabrics/products",
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      use_filename: false,
    });
    uploadedImages.set(url, result.secure_url);
    return result.secure_url;
  } catch (error) {
    // Keep the catalogue seed usable even when a Cloudinary key has expired
    // or the service is temporarily unavailable. Static assets remain bundled.
    canUploadToCloudinary = false;
    console.warn("Cloudinary upload failed; using bundled /products images for this seed run.");
    return url;
  }
}

async function main() {
  const now = new Date();
  const imageMap = new Map<string, string>();
  const allImagePaths = [...new Set([
    ...seedProducts.flatMap((product) => product.imageUrls),
    ...seedCollections.map((collection) => collection.coverImage),
  ].filter((value): value is string => Boolean(value)))];

  for (const imagePath of allImagePaths) {
    imageMap.set(imagePath, await resolveImageUrl(imagePath));
  }

  for (const category of seedCategories) {
    await db.insert(categories).values({ ...category, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: category.name, description: category.description, sortOrder: category.sortOrder, isActive: true, updatedAt: now },
      });
  }

  for (const collection of seedCollections) {
    await db.insert(collections).values({
      ...collection,
      coverImage: imageMap.get(collection.coverImage) ?? collection.coverImage,
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: collections.slug,
      set: {
        name: collection.name,
        description: collection.description,
        coverImage: imageMap.get(collection.coverImage) ?? collection.coverImage,
        isFeatured: collection.isFeatured,
        isActive: true,
        updatedAt: now,
      },
    });
  }

  const productRows = await Promise.all(seedProducts.map(async (product) => ({
    ...product,
    imageUrls: product.imageUrls.map((url) => imageMap.get(url) ?? url),
    // No physical stock quantities were supplied; new products start at zero.
    stock: 0,
    createdAt: new Date(product.createdAt),
    updatedAt: now,
  })));

  const upserted = await db.insert(products).values(productRows).onConflictDoUpdate({
    target: products.sku,
    set: {
      name: sql`excluded.name`,
      slug: sql`excluded.slug`,
      description: sql`excluded.description`,
      category: sql`excluded.category`,
      collection: sql`excluded.collection`,
      fabric: sql`excluded.fabric`,
      colour: sql`excluded.colour`,
      pieces: sql`excluded.pieces`,
      price: sql`excluded.price`,
      compareAtPrice: sql`excluded.compare_at_price`,
      imageUrls: sql`excluded.image_urls`,
      tags: sql`excluded.tags`,
      isFeatured: sql`excluded.is_featured`,
      updatedAt: now,
      // Preserve stock and publication status on existing products. The owner
      // can set verified stock and change publication status from the admin.
    },
  }).returning({ sku: products.sku });

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

  const storageMode = canUploadToCloudinary ? "Cloudinary URLs" : "local /products URLs";
  process.stdout.write(
    `Catalogue seed complete. ${upserted.length} products upserted; ${seedCategories.length} categories and ${seedCollections.length} collections ensured. Images use ${storageMode}.\n` +
    "Existing stock quantities and publication statuses were preserved. New products start with stock 0; update verified quantities in Admin → Products before accepting orders.\n",
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
