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

const now = "2026-11-11T12:00:00.000Z";

export const seedProducts: Product[] = [
  { id: "demo-emerald-bloom", name: "Emerald Bloom", slug: "emerald-bloom", sku: "EHF-2450-001", description: "A graceful three-piece unstitched suit with delicate botanical detailing and a rich emerald palette.", category: "Embroidered suits", collection: "The Signature Edit", fabric: "Lawn", colour: "Emerald", pieces: 3, price: 2450, compareAtPrice: null, stock: 12, imageUrls: ["/products/suit-01.webp"], tags: ["new arrival", "three piece"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-rose-garden", name: "Rose Garden", slug: "rose-garden", sku: "EHF-2450-002", description: "Soft rose tones paired with elegant embroidery for a refined everyday look.", category: "Printed suits", collection: "The Signature Edit", fabric: "Lawn", colour: "Rose pink", pieces: 3, price: 2450, compareAtPrice: null, stock: 9, imageUrls: ["/products/suit-02.webp"], tags: ["soft tones"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-mustard-classic", name: "Mustard Classic", slug: "mustard-classic", sku: "EHF-2450-003", description: "A warm mustard suit with ornamental embroidery and a timeless silhouette.", category: "Embroidered suits", collection: "Autumn Notes", fabric: "Lawn", colour: "Mustard", pieces: 3, price: 2450, compareAtPrice: null, stock: 7, imageUrls: ["/products/suit-03.webp"], tags: ["classic"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-maroon-heritage", name: "Maroon Heritage", slug: "maroon-heritage", sku: "EHF-2500-001", description: "A rich, occasion-ready look with intricate patterning and a deep wine palette.", category: "Printed suits", collection: "The Signature Edit", fabric: "Lawn", colour: "Maroon", pieces: 3, price: 2500, compareAtPrice: null, stock: 5, imageUrls: ["/products/suit-04.webp"], tags: ["occasion wear"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-floral-noir", name: "Floral Noir", slug: "floral-noir", sku: "EHF-2500-002", description: "A dramatic dark base softened by floral accents and a graceful print.", category: "Printed suits", collection: "Autumn Notes", fabric: "Lawn", colour: "Black and berry", pieces: 3, price: 2500, compareAtPrice: null, stock: 8, imageUrls: ["/products/suit-05.webp"], tags: ["floral", "bestseller"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-olive-dusk", name: "Olive Dusk", slug: "olive-dusk", sku: "EHF-2500-003", description: "An understated olive-toned ensemble with a beautifully balanced print.", category: "Printed suits", collection: "Autumn Notes", fabric: "Lawn", colour: "Olive", pieces: 3, price: 2500, compareAtPrice: null, stock: 11, imageUrls: ["/products/suit-06.webp"], tags: ["earth tones"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-sapphire-print", name: "Sapphire Print", slug: "sapphire-print", sku: "EHF-2500-004", description: "A vibrant blue and berry print designed to make everyday dressing feel special.", category: "Printed suits", collection: "The Signature Edit", fabric: "Lawn", colour: "Sapphire", pieces: 3, price: 2500, compareAtPrice: null, stock: 6, imageUrls: ["/products/suit-07.webp"], tags: ["colour pop"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-plum-grace", name: "Plum Grace", slug: "plum-grace", sku: "EHF-2500-005", description: "A graceful plum ensemble with coordinated detailing and rich colour depth.", category: "Printed suits", collection: "The Signature Edit", fabric: "Lawn", colour: "Plum", pieces: 3, price: 2500, compareAtPrice: null, stock: 4, imageUrls: ["/products/suit-08.webp"], tags: ["limited stock"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-sage-story", name: "Sage Story", slug: "sage-story", sku: "EHF-2500-006", description: "A soft sage and neutral print with an elegant, relaxed character.", category: "Printed suits", collection: "Autumn Notes", fabric: "Lawn", colour: "Sage", pieces: 3, price: 2500, compareAtPrice: null, stock: 8, imageUrls: ["/products/suit-09.webp"], tags: ["new arrival"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-azure-day", name: "Azure Day", slug: "azure-day", sku: "EHF-3000-001", description: "An elegant blue-toned three-piece suit with coordinated model and fabric details.", category: "Premium suits", collection: "The Premium Edit", fabric: "Lawn", colour: "Azure", pieces: 3, price: 3000, compareAtPrice: null, stock: 5, imageUrls: ["/products/suit-10.webp"], tags: ["premium", "new arrival"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-black-royale", name: "Black Royale", slug: "black-royale", sku: "EHF-3000-002", description: "A sophisticated black design with statement embroidery and coordinated pieces.", category: "Premium suits", collection: "The Premium Edit", fabric: "Lawn", colour: "Black", pieces: 3, price: 3000, compareAtPrice: null, stock: 3, imageUrls: ["/products/suit-11.webp"], tags: ["premium", "occasion wear"], status: "active", isFeatured: true, createdAt: now, updatedAt: now },
  { id: "demo-rust-embroidery", name: "Rust Embroidery", slug: "rust-embroidery", sku: "EHF-3000-003", description: "A warm rust-coloured suit with intricate embroidery and refined finishing.", category: "Premium suits", collection: "The Premium Edit", fabric: "Lawn", colour: "Rust", pieces: 3, price: 3000, compareAtPrice: null, stock: 6, imageUrls: ["/products/suit-12.webp"], tags: ["premium"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
  { id: "demo-navy-atelier", name: "Navy Atelier", slug: "navy-atelier", sku: "EHF-3000-004", description: "A deep navy statement design with ornate embroidery and a polished finish.", category: "Premium suits", collection: "The Premium Edit", fabric: "Lawn", colour: "Navy", pieces: 3, price: 3000, compareAtPrice: null, stock: 7, imageUrls: ["/products/suit-13.webp"], tags: ["premium"], status: "active", isFeatured: false, createdAt: now, updatedAt: now },
];
