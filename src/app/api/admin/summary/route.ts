import { NextResponse } from "next/server";
import { listProducts } from "@/lib/repositories/products";
import { listOrders } from "@/lib/repositories/orders";
import { listSupportRequests } from "@/lib/repositories/support";
import { hasPermission, requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";
export async function GET() {
  const access = await requirePermission("dashboard:read");
  if (!access.ok) return NextResponse.json({ error: access.message }, { status: access.status });
  try {
    const [canViewProducts, canViewInventory, canViewOrders, canViewSupport] = await Promise.all([
      hasPermission("products:read"), hasPermission("inventory:read"),
      hasPermission("orders:read"), hasPermission("support:read"),
    ]);
    const [products, orders, requests] = await Promise.all([
      canViewProducts ? listProducts({ includeDrafts: true }) : canViewInventory ? listProducts() : Promise.resolve([]),
      canViewOrders ? listOrders() : Promise.resolve([]),
      canViewSupport ? listSupportRequests() : Promise.resolve([]),
    ]);
    const activeProducts = products.filter((product) => product.status === "active");
    const lowStock = activeProducts.filter((product) => product.stock <= 3);
    const revenue = orders.filter((order) => order.status !== "cancelled").reduce((total, order) => total + order.total, 0);
    return NextResponse.json({ data: {
      products: canViewProducts ? activeProducts.length : 0,
      orders: canViewOrders ? orders.length : 0,
      revenue: canViewOrders ? revenue : 0,
      lowStock: canViewInventory ? lowStock.length : 0,
      openRequests: canViewSupport ? requests.filter((request) => !["completed", "closed"].includes(request.status)).length : 0,
      lowStockProducts: canViewInventory ? lowStock.slice(0, 6) : [],
      recentOrders: canViewOrders ? orders.slice(0, 5) : [],
      supportRequests: canViewSupport ? requests.slice(0, 5) : [],
    } });
  } catch (error) {
    console.error("GET /api/admin/summary", error);
    return NextResponse.json({ error: "Unable to load dashboard summary." }, { status: 500 });
  }
}
