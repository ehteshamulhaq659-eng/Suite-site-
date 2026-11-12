import suitImageManifest from "./suit-image-manifest.json";

export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: string;
  collection: string;
  fabric: string;
  colour: string;
  pieces: number;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrls: string[];
  tags: string[];
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

// Retain the original starter catalogue for reference; only verified supplied products are seeded.
const now = "2026-11-11T12:00:00.000Z";

export const starterProducts: Product[] = [
  {
    id: "ehf-seed-001", name: "Emerald Bloom", slug: "emerald-bloom", sku: "EHF-2450-001",
    description: "A deep emerald suit with delicate light embroidery and a graceful, polished look. Contact E&H for fabric composition and current availability.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Emerald green", pieces: 3,
    price: 2450, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-01.webp", "/products/suit-01-detail.webp"],
    tags: ["emerald", "embroidered", "three piece", "signature"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-002", name: "Rose Garden", slug: "rose-garden", sku: "EHF-2450-002",
    description: "A soft rose-pink suit with fine, coordinated embroidery. Contact E&H for fabric composition and current availability.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Rose pink", pieces: 3,
    price: 2450, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-02.webp", "/products/suit-02-detail.webp"],
    tags: ["pink", "embroidered", "three piece", "signature"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-003", name: "Marigold Threadwork", slug: "marigold-threadwork", sku: "EHF-2450-003",
    description: "A warm marigold-toned suit with decorative threadwork shown in the product photographs. Ask our team for more details before ordering.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Mustard yellow", pieces: 3,
    price: 2450, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-03.webp", "/products/suit-03-detail.webp"],
    tags: ["mustard", "embroidered", "three piece"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-004", name: "Maroon Heritage", slug: "maroon-heritage", sku: "EHF-2500-001",
    description: "A rich maroon and warm-neutral ensemble with coordinated printed and embroidered details. Contact E&H to confirm the set contents.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Maroon and beige", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-04.webp", "/products/suit-04-detail.webp"],
    tags: ["maroon", "occasion", "three piece"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-005", name: "Midnight Floral", slug: "midnight-floral", sku: "EHF-2500-002",
    description: "A dark base with small floral motifs, presented as a coordinated folded fabric set. Contact E&H for exact fabric and piece details.",
    category: "Printed suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Midnight navy and pink", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-05.webp"],
    tags: ["floral", "dark tones", "printed"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-006", name: "Forest Green Classic", slug: "forest-green-classic", sku: "EHF-2500-003",
    description: "A deep green suit with a contrasting patterned border and coordinated pieces. Contact E&H for exact fabric and set details.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Forest green", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-06.webp", "/products/suit-06-detail.webp"],
    tags: ["green", "embroidered", "three piece"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-007", name: "Berry Blue Print", slug: "berry-blue-print", sku: "EHF-2500-004",
    description: "A vibrant berry-and-blue printed fabric combination for a colourful everyday look. Contact E&H for fabric composition and availability.",
    category: "Printed suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Berry pink and blue", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-07.webp"],
    tags: ["berry", "blue", "printed"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-008", name: "Plum Grace", slug: "plum-grace", sku: "EHF-2500-005",
    description: "A plum-coloured suit with coordinated decorative detailing and a rich, elegant palette. Contact E&H for exact fabric and set details.",
    category: "Embroidered suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Plum purple", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-08.webp", "/products/suit-08-detail.webp"],
    tags: ["plum", "purple", "embroidered"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-009", name: "Burnt Sienna", slug: "burnt-sienna", sku: "EHF-2500-006",
    description: "A warm burnt-orange suit with a bold all-over pattern and matching styling. Contact E&H for fabric composition and current availability.",
    category: "Printed suits", collection: "The Signature Edit", fabric: "Unstitched suit", colour: "Burnt orange", pieces: 3,
    price: 2500, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-09.webp", "/products/suit-09-detail.webp"],
    tags: ["orange", "printed", "three piece"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-010", name: "Slate & Sand", slug: "slate-and-sand", sku: "EHF-3000-001",
    description: "A muted slate-blue and sand-toned fabric design with fine repeating details. Contact E&H for fabric composition and set details.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Slate blue and sand", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-10.webp"],
    tags: ["premium", "blue", "neutral"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-011", name: "Copper Garden", slug: "copper-garden", sku: "EHF-3000-002",
    description: "A copper, blue and muted-neutral printed design with a detailed floral composition. Contact E&H for exact fabric and piece details.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Copper and blue", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-11.webp"],
    tags: ["premium", "copper", "floral"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-012", name: "Powder Blue Elegance", slug: "powder-blue-elegance", sku: "EHF-3000-003",
    description: "A powder-blue suit with coordinated embroidered detailing and a soft, graceful colour story. Contact E&H to confirm exact set contents.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Powder blue", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-12.webp"],
    tags: ["premium", "powder blue", "embroidered"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-013", name: "Black Royale", slug: "black-royale", sku: "EHF-3000-004",
    description: "A black suit with ornate light embroidery and a striking, timeless appearance. Contact E&H for fabric composition and availability.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Black", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-13.webp", "/products/suit-13-detail.webp"],
    tags: ["premium", "black", "embroidered"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-014", name: "Rust & Gold", slug: "rust-and-gold", sku: "EHF-3000-005",
    description: "A rust-toned fabric set with contrasting pale embroidery and a warm, occasion-ready palette. Contact E&H for exact details.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Rust and gold", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-14.webp"],
    tags: ["premium", "rust", "embroidered"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-015", name: "Midnight Navy", slug: "midnight-navy", sku: "EHF-3000-006",
    description: "A deep navy fabric set with gold-toned ornamental embroidery. Contact E&H for composition and availability.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Midnight navy", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-15.webp"],
    tags: ["premium", "navy", "embroidered"], status: "active", isFeatured: false, createdAt: now, updatedAt: now,
  },
  {
    id: "ehf-seed-016", name: "Peacock Teal", slug: "peacock-teal", sku: "EHF-3000-007",
    description: "A vivid teal-blue suit with coordinated embroidered detailing. Contact E&H for fabric composition and current availability.",
    category: "Premium suits", collection: "The Premium Edit", fabric: "Unstitched suit", colour: "Teal blue", pieces: 3,
    price: 3000, compareAtPrice: null, stock: 0,
    imageUrls: ["/products/suit-16.webp"],
    tags: ["premium", "teal", "embroidered"], status: "active", isFeatured: true, createdAt: now, updatedAt: now,
  },
];

export const seedProducts: Product[] = suitImageManifest.map((photo) => ({
  id: `ehf-${photo.sku.toLowerCase()}`,
  name: `Style ${String(photo.sequence).padStart(2, "0")}`,
  slug: photo.sku.toLowerCase(),
  sku: photo.sku,
  description: "Product details and current availability are being confirmed. Contact E&H Fabrics before placing an order.",
  category: `PKR ${photo.price.toLocaleString("en-PK")}`,
  collection: `Rs. ${photo.price.toLocaleString("en-PK")} Collection`,
  fabric: "",
  colour: "",
  pieces: 0,
  price: photo.price,
  compareAtPrice: null,
  stock: 0,
  imageUrls: [photo.imageUrl],
  tags: ["ladies' suit", `PKR ${photo.price}`],
  status: "active",
  isFeatured: photo.sequence <= 2,
  createdAt: photo.createdAt,
  updatedAt: photo.createdAt,
}));

export const seedCategories = [
  { id: "ehf-category-2800", name: "PKR 2,800", slug: "pkr-2800", description: "Products from the Rs. 2,800 price folder.", sortOrder: 1, isActive: true },
  { id: "ehf-category-3000", name: "PKR 3,000", slug: "pkr-3000", description: "Products from the Rs. 3,000 price folder.", sortOrder: 2, isActive: true },
  { id: "ehf-category-3500", name: "PKR 3,500", slug: "pkr-3500", description: "Products from the Rs. 3,500 price folder.", sortOrder: 3, isActive: true },
  { id: "ehf-category-4500", name: "PKR 4,500", slug: "pkr-4500", description: "Products from the Rs. 4,500 price folder.", sortOrder: 4, isActive: true },
];

export const seedCollections = [2800, 3000, 3500, 4500].map((price) => {
  const formattedPrice = price.toLocaleString("en-PK");
  return {
    id: `ehf-collection-${price}`,
    name: `Rs. ${formattedPrice} Collection`,
    slug: `rs-${price}-collection`,
    description: `Ladies' suits listed at Rs. ${formattedPrice}.`,
    coverImage: suitImageManifest.find((photo) => photo.price === price)?.imageUrl ?? "",
    isFeatured: true,
    isActive: true,
  };
});
