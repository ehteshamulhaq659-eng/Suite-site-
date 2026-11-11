import "server-only";
import { listProducts, updateProduct } from "@/lib/repositories/products";
import { getStoreSettings } from "@/lib/repositories/settings";

export type OrderInput = {
  items: { productId: string; quantity: number }[];
  userId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province?: string;
  postalCode?: string;
  paymentMethod: "cash_on_delivery" | "bank_transfer";
  customerNote?: string;
};

export type OrderRecord = {
  id: string; orderNumber: string; userId?: string; customerName: string; customerPhone: string; customerEmail?: string;
  city: string; total: number; subtotal: number; deliveryFee: number; status: string; paymentMethod: string;
  paymentStatus: string; itemCount: number; createdAt: string; items?: { productId: string; quantity: number }[];
};

const globalForOrders = globalThis as unknown as { ehDemoOrders?: OrderRecord[] };
const demoOrders = globalForOrders.ehDemoOrders ??= [
  { id: "demo-order-001", orderNumber: "EHF-261110-001", customerName: "Ayesha Khan", customerPhone: "03xx-xxx-xxxx", city: "Lahore", total: 5450, subtotal: 5200, deliveryFee: 250, status: "processing", paymentMethod: "cash_on_delivery", paymentStatus: "pending", itemCount: 2, createdAt: "2026-11-10T11:30:00.000Z" },
  { id: "demo-order-002", orderNumber: "EHF-261109-002", customerName: "Sara Ahmed", customerPhone: "03xx-xxx-xxxx", city: "Islamabad", total: 3250, subtotal: 3000, deliveryFee: 250, status: "confirmed", paymentMethod: "bank_transfer", paymentStatus: "pending", itemCount: 1, createdAt: "2026-11-09T09:20:00.000Z" },
];

function makeOrderNumber() {
  const day = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `EHF-${day}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function deliveryFor(subtotal: number, settings: { deliveryFee: number; freeDeliveryThreshold: number }) {
  return settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
}

export async function createOrder(input: OrderInput) {
  if (process.env.DATA_MODE !== "neon") {
    const products = await listProducts({ includeDrafts: false });
    const quantities = new Map<string, number>();
    for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    const uniqueLines = [...quantities.entries()].map(([productId, quantity]) => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) throw new Error("One of the selected products is no longer available.");
      if (product.stock < quantity) throw new Error(`${product.name} does not have enough stock available.`);
      return { product, quantity };
    });
    const settings = await getStoreSettings();
    const subtotal = uniqueLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const deliveryFee = deliveryFor(subtotal, settings);
    const id = crypto.randomUUID();
    const record: OrderRecord = {
      id, orderNumber: makeOrderNumber(), userId: input.userId, customerName: input.customerName, customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || undefined, city: input.city, total: subtotal + deliveryFee,
      subtotal, deliveryFee, status: "pending", paymentMethod: input.paymentMethod, paymentStatus: "pending",
      itemCount: uniqueLines.reduce((sum, line) => sum + line.quantity, 0), createdAt: new Date().toISOString(),
      items: uniqueLines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
    };
    for (const line of uniqueLines) await updateProduct(line.product.id, { stock: line.product.stock - line.quantity });
    demoOrders.unshift(record);
    return record;
  }

  const { db } = await import("@/db");
  const { products, orders, orderItems, inventoryMovements } = await import("@/db/schema");
  const { inArray, eq, gte, and } = await import("drizzle-orm");
  const orderNumber = makeOrderNumber();
  return await db.transaction(async (tx) => {
    const productIds = [...new Set(input.items.map((item) => item.productId))];
    const rows = await tx.select().from(products).where(inArray(products.id, productIds)).for("update");
    const byId = new Map(rows.map((row) => [row.id, row]));
    const quantities = new Map<string, number>();
    for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    const uniqueLines = [...quantities.entries()].map(([productId, quantity]) => {
      const product = byId.get(productId);
      if (!product || product.status !== "active") throw new Error("One of the selected products is no longer available.");
      if (product.stock < quantity) throw new Error(`${product.name} does not have enough stock available.`);
      return { product, quantity };
    });
    const settings = await getStoreSettings();
    const subtotal = uniqueLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const deliveryFee = deliveryFor(subtotal, settings);
    const id = crypto.randomUUID();
    await tx.insert(orders).values({
      id, orderNumber, userId: input.userId || null, customerName: input.customerName, customerEmail: input.customerEmail || null,
      customerPhone: input.customerPhone, addressLine1: input.addressLine1, addressLine2: input.addressLine2 || null,
      city: input.city, province: input.province || null, postalCode: input.postalCode || null,
      subtotal, deliveryFee, total: subtotal + deliveryFee, currency: process.env.STORE_CURRENCY || "PKR",
      paymentMethod: input.paymentMethod, paymentStatus: "pending", status: "pending", customerNote: input.customerNote || null,
    });
    for (const line of uniqueLines) {
      const newStock = line.product.stock - line.quantity;
      const changed = await tx.update(products).set({ stock: newStock, updatedAt: new Date() })
        .where(and(eq(products.id, line.product.id), gte(products.stock, line.quantity))).returning({ id: products.id });
      if (!changed.length) throw new Error(`${line.product.name} stock changed. Please refresh your cart.`);
      await tx.insert(orderItems).values({
        id: crypto.randomUUID(), orderId: id, productId: line.product.id, productName: line.product.name,
        sku: line.product.sku, unitPrice: line.product.price, quantity: line.quantity, lineTotal: line.product.price * line.quantity,
      });
      await tx.insert(inventoryMovements).values({
        id: crypto.randomUUID(), productId: line.product.id, change: -line.quantity, quantityAfter: newStock,
        reason: "Order placed", referenceId: id,
      });
    }
    return {
      id, orderNumber, customerName: input.customerName, customerPhone: input.customerPhone,
      customerEmail: input.customerEmail, city: input.city, subtotal, deliveryFee, total: subtotal + deliveryFee,
      status: "pending", paymentMethod: input.paymentMethod, paymentStatus: "pending",
      itemCount: uniqueLines.reduce((sum, line) => sum + line.quantity, 0), createdAt: new Date().toISOString(),
    } satisfies OrderRecord;
  });
}

export async function listOrders(): Promise<OrderRecord[]> {
  if (process.env.DATA_MODE !== "neon") return [...demoOrders];
  const { db } = await import("@/db");
  const { orders, orderItems } = await import("@/db/schema");
  const { desc, eq, sql } = await import("drizzle-orm");
  const rows = await db.select({
    id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, customerPhone: orders.customerPhone,
    customerEmail: orders.customerEmail, city: orders.city, total: orders.total, subtotal: orders.subtotal,
    deliveryFee: orders.deliveryFee, status: orders.status, paymentMethod: orders.paymentMethod,
    paymentStatus: orders.paymentStatus, createdAt: orders.createdAt,
    itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
  }).from(orders).leftJoin(orderItems, eq(orderItems.orderId, orders.id)).groupBy(orders.id).orderBy(desc(orders.createdAt)).limit(100);
  return rows.map((row) => ({
    ...row,
    customerEmail: row.customerEmail ?? undefined,
    itemCount: Number(row.itemCount),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listCustomerOrders(userId: string) {
  if (process.env.DATA_MODE !== "neon") return demoOrders.filter((order) => order.userId === userId);
  const { db } = await import("@/db");
  const { orders, orderItems } = await import("@/db/schema");
  const { desc, eq, sql } = await import("drizzle-orm");
  const rows = await db.select({
    id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, total: orders.total,
    status: orders.status, paymentMethod: orders.paymentMethod, paymentStatus: orders.paymentStatus,
    createdAt: orders.createdAt, itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
  }).from(orders).leftJoin(orderItems, eq(orderItems.orderId, orders.id)).where(eq(orders.userId, userId))
    .groupBy(orders.id).orderBy(desc(orders.createdAt)).limit(100);
  return rows.map((row) => ({ ...row, itemCount: Number(row.itemCount), createdAt: row.createdAt.toISOString() }));
}

export async function updateOrderStatus(id: string, status: string) {
  const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new Error("Invalid order status.");
  if (process.env.DATA_MODE !== "neon") {
    const record = demoOrders.find((order) => order.id === id);
    if (!record) return null;
    if (record.status === "cancelled" && status !== "cancelled") throw new Error("A cancelled order cannot be reopened. Create a new order instead.");
    if (status === "cancelled" && record.status !== "cancelled") {
      if (["shipped", "delivered"].includes(record.status)) throw new Error("Shipped or delivered orders must be handled through the returns process.");
      for (const item of record.items ?? []) {
        const product = await listProducts({ includeDrafts: true }).then((rows) => rows.find((candidate) => candidate.id === item.productId));
        if (product) await updateProduct(product.id, { stock: product.stock + item.quantity });
      }
    }
    record.status = status;
    return record;
  }
  const { db } = await import("@/db");
  const { orders, orderItems, products, inventoryMovements } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  return await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!existing) return null;
    if (existing.status === "cancelled" && status !== "cancelled") throw new Error("A cancelled order cannot be reopened. Create a new order instead.");
    if (status === "cancelled" && existing.status !== "cancelled") {
      if (["shipped", "delivered"].includes(existing.status)) throw new Error("Shipped or delivered orders must be handled through the returns process.");
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of items) {
        if (!item.productId) continue;
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId)).for("update");
        if (!product) continue;
        const newStock = product.stock + item.quantity;
        await tx.update(products).set({ stock: newStock, updatedAt: new Date() }).where(eq(products.id, product.id));
        await tx.insert(inventoryMovements).values({
          id: crypto.randomUUID(), productId: product.id, change: item.quantity, quantityAfter: newStock,
          reason: "Order cancelled", referenceId: id,
        });
      }
    }
    const [updated] = await tx.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated ?? null;
  });
}
