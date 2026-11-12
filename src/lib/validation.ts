import { z } from "zod";

const imageUrlSchema = z.string().refine((value) => {
  if (value.startsWith("/")) return !value.startsWith("//");
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "res.cloudinary.com"; } catch { return false; }
}, "Use a local image path or a secure HTTPS image URL.");

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().min(3).max(64).regex(/^[A-Za-z0-9_-]+$/, "SKU can contain letters, numbers, hyphens and underscores."),
  description: z.string().trim().max(5000).default(""),
  category: z.string().trim().min(2).max(120).default("Unstitched suits"),
  collection: z.string().trim().max(120).default(""),
  fabric: z.string().trim().max(120).default(""),
  colour: z.string().trim().max(80).default(""),
  pieces: z.number().int().min(0).max(10).default(0),
  price: z.number().int().min(1).max(10_000_000),
  compareAtPrice: z.number().int().min(1).max(10_000_000).nullable().optional(),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  imageUrls: z.array(imageUrlSchema).min(1).max(10).default([]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  status: z.enum(["active", "draft", "archived"]).default("draft"),
  isFeatured: z.boolean().default(false),
});

export const orderInputSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(10) })).min(1).max(50),
  customerName: z.string().trim().min(2).max(160),
  customerEmail: z.email().optional().or(z.literal("")),
  customerPhone: z.string().trim().min(7).max(32),
  addressLine1: z.string().trim().min(5).max(500),
  addressLine2: z.string().trim().max(500).optional(),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(24).optional(),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
  customerNote: z.string().trim().max(1000).optional(),
});

export const supportRequestInputSchema = z.object({
  customerName: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(7).max(32),
  email: z.email().optional().or(z.literal("")),
  preferredColour: z.string().trim().max(80).optional(),
  fabricPreference: z.string().trim().max(120).optional(),
  budget: z.number().int().min(0).max(10_000_000).optional(),
  description: z.string().trim().min(10).max(3000),
  referenceImageUrl: imageUrlSchema.optional().or(z.literal("")),
});
