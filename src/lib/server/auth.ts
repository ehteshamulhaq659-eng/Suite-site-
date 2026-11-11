import "server-only";
import { headers } from "next/headers";

export type StaffRole = "admin" | "manager" | "catalog" | "orders" | "support" | "customer";
export type Permission =
  | "dashboard:read"
  | "products:read"
  | "products:write"
  | "products:delete"
  | "inventory:read"
  | "inventory:write"
  | "orders:read"
  | "orders:write"
  | "customers:read"
  | "support:read"
  | "support:write"
  | "staff:manage"
  | "settings:manage";

const permissionMap: Record<StaffRole, Permission[]> = {
  admin: ["dashboard:read", "products:read", "products:write", "products:delete", "inventory:read", "inventory:write", "orders:read", "orders:write", "customers:read", "support:read", "support:write", "staff:manage", "settings:manage"],
  manager: ["dashboard:read", "products:read", "products:write", "products:delete", "inventory:read", "inventory:write", "orders:read", "orders:write", "customers:read", "support:read", "support:write"],
  catalog: ["dashboard:read", "products:read", "products:write", "inventory:read", "inventory:write"],
  orders: ["dashboard:read", "orders:read", "orders:write", "customers:read", "inventory:read"],
  support: ["dashboard:read", "products:read", "orders:read", "customers:read", "support:read", "support:write"],
  customer: [],
};

export type SessionUser = { id: string; name: string; email: string; role: StaffRole };

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (process.env.DATA_MODE !== "neon") {
    if (process.env.NODE_ENV === "production") return null;
    return { id: "demo-admin", name: "E&H Administrator", email: "admin@ehfabrics.local", role: "admin" };
  }

  const { auth } = await import("@/lib/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  const allowed: StaffRole[] = ["admin", "manager", "catalog", "orders", "support", "customer"];
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: allowed.includes(role as StaffRole) ? (role as StaffRole) : "customer",
  };
}

export async function hasPermission(permission: Permission) {
  const user = await getCurrentUser();
  return Boolean(user && permissionMap[user.role]?.includes(permission));
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, status: 401, message: "Please sign in to continue." };
  if (!permissionMap[user.role]?.includes(permission)) return { ok: false as const, status: 403, message: "You do not have permission to perform this action." };
  return { ok: true as const, user };
}
