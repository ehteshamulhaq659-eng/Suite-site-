import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// Better Auth tables. Keep these field names aligned with Better Auth's Drizzle adapter.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [index("session_user_id_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("account_user_id_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const collections = pgTable("collections", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 120 }).notNull().default("Unstitched suits"),
  collection: varchar("collection", { length: 120 }),
  fabric: varchar("fabric", { length: 120 }),
  colour: varchar("colour", { length: 80 }),
  pieces: integer("pieces").notNull().default(3),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  stock: integer("stock").notNull().default(0),
  imageUrls: jsonb("image_urls").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("products_status_idx").on(table.status),
  index("products_category_idx").on(table.category),
  index("products_created_at_idx").on(table.createdAt),
]);

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 254 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("customers_phone_idx").on(table.phone)]);

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 40 }).notNull().default("Home"),
  recipientName: varchar("recipient_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 24 }),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("addresses_customer_idx").on(table.customerId)]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 254 }),
  customerPhone: varchar("customer_phone", { length: 32 }).notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 24 }),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  total: integer("total").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("PKR"),
  paymentMethod: varchar("payment_method", { length: 32 }).notNull().default("cash_on_delivery"),
  paymentStatus: varchar("payment_status", { length: 24 }).notNull().default("pending"),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  customerNote: text("customer_note"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("orders_customer_idx").on(table.customerId),
  index("orders_status_idx").on(table.status),
  index("orders_created_at_idx").on(table.createdAt),
]);

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 180 }).notNull(),
  sku: varchar("sku", { length: 64 }),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
}, (table) => [index("order_items_order_idx").on(table.orderId)]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  change: integer("change").notNull(),
  quantityAfter: integer("quantity_after").notNull(),
  reason: varchar("reason", { length: 120 }).notNull(),
  referenceId: text("reference_id"),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}, (table) => [index("inventory_product_idx").on(table.productId)]);

export const supportRequests = pgTable("support_requests", {
  id: text("id").primaryKey(),
  requestNumber: varchar("request_number", { length: 32 }).notNull().unique(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 254 }),
  preferredColour: varchar("preferred_colour", { length: 80 }),
  fabricPreference: varchar("fabric_preference", { length: 120 }),
  budget: integer("budget"),
  description: text("description").notNull(),
  referenceImageUrl: text("reference_image_url"),
  status: varchar("status", { length: 24 }).notNull().default("new"),
  internalNotes: text("internal_notes"),
  assignedTo: text("assigned_to").references(() => user.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("support_status_idx").on(table.status), index("support_created_at_idx").on(table.createdAt)]);

export const wishlists = pgTable("wishlists", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (table) => [uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productId)]);

export const storeSettings = pgTable("store_settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: updatedAt(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
}, (table) => [index("audit_logs_entity_idx").on(table.entityType, table.entityId), index("audit_logs_created_at_idx").on(table.createdAt)]);

export const authSchema = { user, session, account, verification };
