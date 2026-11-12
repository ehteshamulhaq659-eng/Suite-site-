"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Product } from "@/data/products";

type Order = { id: string; orderNumber: string; customerName: string; customerPhone: string; city: string; total: number; status: string; paymentMethod: string; paymentStatus: string; itemCount: number; createdAt: string };
type Support = { id: string; requestNumber: string; customerName: string; phone: string; preferredColour?: string; fabricPreference?: string; budget?: number; description: string; referenceImageUrl?: string; status: string; createdAt: string };
type Summary = { products: number; orders: number; revenue: number; lowStock: number; openRequests: number; lowStockProducts: Product[]; recentOrders: Order[]; supportRequests: Support[] };
type StoreSettings = { deliveryFee: number; freeDeliveryThreshold: number; whatsappNumber: string; storeEmail: string; storePhone: string; bankTransferInstructions: string };
type StaffMember = { id: string; name: string; email: string; role: string };

const emptySettings: StoreSettings = { deliveryFee: 250, freeDeliveryThreshold: 0, whatsappNumber: "", storeEmail: "", storePhone: "", bankTransferInstructions: "Our team will share the bank transfer details when confirming your order." };
const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const supportOptions = ["new", "under_review", "matched", "quotation_sent", "completed", "closed"];
const roleDescriptions: Record<string, string> = { admin: "All store and staff permissions", manager: "Products, orders, inventory and support", catalog: "Products and stock management", orders: "Orders, customers and stock visibility", support: "Customer requests and order visibility", customer: "Customer account access" };

function money(value: number) { return `PKR ${value.toLocaleString("en-PK")}`; }
function pretty(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase()); }

export function AdminConsole({ initialUser, modeLabel }: { initialUser: { id: string; name: string; email: string; role: string }; modeLabel: string }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<Support[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(emptySettings);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const productEndpoint = ["admin", "manager", "catalog", "support"].includes(initialUser.role)
        ? "/api/products?includeDrafts=true" : "/api/inventory";
      const [summaryRes, productRes, orderRes, supportRes] = await Promise.all([
        fetch("/api/admin/summary", { cache: "no-store" }), fetch(productEndpoint, { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }), fetch("/api/support-requests", { cache: "no-store" }),
      ]);
      const [summaryJson, productJson, orderJson, supportJson] = await Promise.all([summaryRes.json(), productRes.json(), orderRes.json(), supportRes.json()]);
      if (!summaryRes.ok) throw new Error(summaryJson.error || "Unable to load admin dashboard.");
      setSummary(summaryJson.data); setProducts(productJson.data ?? []); setOrders(orderJson.data ?? []); setRequests(supportJson.data ?? []);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to load dashboard data."); }
    finally { setLoading(false); }
  }, [initialUser.role]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (activeTab === "settings") void fetch("/api/admin/settings").then(async (res) => { const json = await res.json(); if (res.ok) setSettings(json.data); else setNotice(json.error); });
    if (activeTab === "staff") void fetch("/api/admin/staff").then(async (res) => { const json = await res.json(); if (res.ok) setStaff(json.data); else setNotice(json.error); });
  }, [activeTab]);

  const activeProducts = useMemo(() => products.filter((product) => product.status === "active"), [products]);

  function openNewProduct() { setEditing(null); setModalOpen(true); }
  function openEditProduct(product: Product) { setEditing(product); setModalOpen(true); }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setNotice("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const imageUrls = String(form.get("imageUrls") || "").split(",").map((url) => url.trim()).filter(Boolean).slice(0, 10);
    const imageFiles = form.getAll("imageFiles").filter((item): item is File => item instanceof File && item.size > 0);
    try {
      if (imageFiles.length > 0) {
        setUploading(true);
        for (const imageFile of imageFiles.slice(0, Math.max(0, 10 - imageUrls.length))) {
          const upload = new FormData(); upload.append("file", imageFile);
          const response = await fetch("/api/uploads", { method: "POST", body: upload });
          const json = await response.json();
          if (!response.ok) throw new Error(json.error || `Unable to upload ${imageFile.name}.`);
          imageUrls.push(json.data.url as string);
        }
      }
      if (imageUrls.length === 0) throw new Error("Add at least one product image URL or upload a photograph.");
      const payload = {
        name: String(form.get("name") || ""), sku: String(form.get("sku") || ""),
        description: String(form.get("description") || ""), category: String(form.get("category") || "Unstitched suits"),
        collection: String(form.get("collection") || ""), fabric: String(form.get("fabric") || ""),
        colour: String(form.get("colour") || ""), pieces: Number(form.get("pieces") || 3),
        price: Number(form.get("price") || 0), compareAtPrice: null, stock: Number(form.get("stock") || 0),
        imageUrls: imageUrls.slice(0, 10), tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
        status: String(form.get("status") || "active"), isFeatured: form.get("isFeatured") === "on",
      };
      const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error || "Unable to save product.");
      setNotice(editing ? "Product updated successfully." : "Product added successfully."); setModalOpen(false); await refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save product."); }
    finally { setSaving(false); setUploading(false); }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Permanently delete ${product.name}?`)) return;
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const json = await response.json();
    setNotice(response.ok ? "Product deleted." : json.error || "Unable to delete product.");
    if (response.ok) await refresh();
  }

  async function setOrderStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const json = await response.json(); setNotice(response.ok ? "Order status updated." : json.error || "Unable to update order."); if (response.ok) await refresh();
  }

  async function setSupportStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/support-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const json = await response.json(); setNotice(response.ok ? "Request status updated." : json.error || "Unable to update request."); if (response.ok) await refresh();
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const json = await response.json(); setNotice(response.ok ? "Store settings saved." : json.error || "Unable to save settings."); if (response.ok) setSettings(json.data);
  }

  async function changeStaffRole(userId: string, role: string) {
    const response = await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role }) });
    const json = await response.json(); setNotice(response.ok ? "Staff role updated." : json.error || "Unable to update staff role.");
    if (response.ok) setStaff((current) => current.map((member) => member.id === userId ? { ...member, role } : member));
  }

  const allTabs = [{ id: "overview", label: "Overview", icon: "◫" }, { id: "products", label: "Products", icon: "▧" }, { id: "orders", label: "Orders", icon: "▤" }, { id: "inventory", label: "Inventory", icon: "▥" }, { id: "support", label: "Customer requests", icon: "✳" }, { id: "staff", label: "Staff & access", icon: "♙" }, { id: "settings", label: "Store settings", icon: "⚙" }];
  const roleTabs: Record<string, string[]> = {
    admin: ["overview", "products", "orders", "inventory", "support", "staff", "settings"],
    manager: ["overview", "products", "orders", "inventory", "support"],
    catalog: ["overview", "products", "inventory"],
    orders: ["overview", "orders", "inventory"],
    support: ["overview", "support"],
  };
  const tabs = allTabs.filter((tab) => (roleTabs[initialUser.role] ?? []).includes(tab.id));
  const canViewProducts = ["admin", "manager", "catalog", "support"].includes(initialUser.role);
  const canWriteProducts = ["admin", "manager", "catalog"].includes(initialUser.role);
  const canDeleteProducts = ["admin", "manager"].includes(initialUser.role);
  const canViewOrders = ["admin", "manager", "orders", "support"].includes(initialUser.role);
  const canViewSupport = ["admin", "manager", "support"].includes(initialUser.role);
  const canViewInventory = ["admin", "manager", "catalog", "orders"].includes(initialUser.role);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar"><Link href="/" className="admin-brand"><Image src="/brand/eh-fabrics-reversed.svg" alt="E&H Fabrics" width={170} height={66}/><span>STORE MANAGEMENT</span></Link><div className="admin-menu-label">WORKSPACE</div><nav>{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}><span>{tab.icon}</span>{tab.label}{tab.id === "support" && summary?.openRequests ? <i>{summary.openRequests}</i> : null}</button>)}</nav><div className="admin-sidebar-bottom"><div className="admin-user-avatar">{initialUser.name.slice(0, 1)}</div><div><b>{initialUser.name}</b><small>{pretty(initialUser.role)}</small></div><Link href="/" title="View storefront">↗</Link></div></aside>
      <main className="admin-main"><header className="admin-topbar"><div><div className="admin-crumb">E&H FABRICS <span>/</span> {pretty(activeTab)}</div><h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1></div><div className="admin-top-actions"><span className="demo-mode-pill">{modeLabel}</span><Link href="/" className="view-store-link">View storefront ↗</Link></div></header>
        {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
        {loading ? <div className="admin-loading">Loading your store workspace…</div> : null}
        {activeTab === "overview" && summary && <section className="admin-content"><div className="admin-welcome"><div><span className="eyebrow">YOUR BUSINESS AT A GLANCE</span><h2>Good day, {initialUser.name.split(" ")[0]}.</h2><p>Here is what is happening across your E&H store.</p></div>{canWriteProducts && <button className="admin-primary-button" onClick={openNewProduct}>＋ Add new product</button>}</div><div className="metric-grid">{canViewProducts && <Metric label="Active products" value={summary.products.toString()} note="Live in your shop" icon="▧"/>}{canViewOrders && <><Metric label="Orders received" value={summary.orders.toString()} note="All recorded orders" icon="▤"/><Metric label="Recorded revenue" value={money(summary.revenue)} note="Recorded orders" icon="◈"/></>}{canViewInventory && <Metric label="Low stock" value={summary.lowStock.toString()} note="Three or fewer pieces" icon="◌"/>}{canViewSupport && <Metric label="Open requests" value={summary.openRequests.toString()} note="Customer suit enquiries" icon="✳"/>}</div><div className="admin-two-columns"><div className="admin-panel"><div className="panel-heading"><div><h3>Recent orders</h3><p>Latest customer purchases</p></div>{canViewOrders && <button className="panel-link" onClick={() => setActiveTab("orders")}>View all ↗</button>}</div><div className="simple-table"><div className="table-header"><span>ORDER</span><span>CUSTOMER</span><span>TOTAL</span><span>STATUS</span></div>{canViewOrders ? summary.recentOrders.map((order) => <div className="table-row" key={order.id}><b>{order.orderNumber}</b><span>{order.customerName}</span><strong>{money(order.total)}</strong><StatusPill status={order.status}/></div>) : <p className="quiet-empty">Order data is restricted for this role.</p>}</div></div><div className="admin-panel"><div className="panel-heading"><div><h3>Stock watch</h3><p>Products that need attention</p></div>{canViewInventory && <button className="panel-link" onClick={() => setActiveTab("inventory")}>Inventory ↗</button>}</div>{!canViewInventory ? <p className="quiet-empty">Inventory information is restricted for this role.</p> : summary.lowStockProducts.length === 0 ? <p className="quiet-empty">No low-stock alerts right now.</p> : summary.lowStockProducts.map((product) => <div className="stock-watch-row" key={product.id}><div className="stock-watch-thumb"><Image src={product.imageUrls[0] || "/brand/eh-fabrics-icon.png"} alt={product.name} fill sizes="48px"/></div><div><b>{product.name}</b><small>{product.sku}</small></div><strong className="stock-warning">{product.stock} left</strong></div>)}</div></div></section>}

        {activeTab === "products" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Product catalogue</h2><p>Add new suits, update descriptions, prices and availability.</p></div><button className="admin-primary-button" onClick={openNewProduct}>＋ Add product</button></div><div className="admin-panel table-panel"><div className="simple-table wide-table"><div className="table-header product-table-head"><span>PRODUCT</span><span>SKU / CATEGORY</span><span>PRICE</span><span>STOCK</span><span>STATUS</span><span>ACTIONS</span></div>{products.map((product) => <div className="table-row product-table-row" key={product.id}><div className="table-product-cell"><div className="table-product-thumb"><Image src={product.imageUrls[0] || "/brand/eh-fabrics-icon.png"} alt={product.name} fill sizes="54px"/></div><div><b>{product.name}</b><small>{product.colour || "Colour not set"}</small></div></div><span>{product.sku}<small>{product.category}</small></span><strong>{money(product.price)}</strong><b className={product.stock <= 3 ? "stock-warning" : ""}>{product.stock}</b><StatusPill status={product.status}/><div className="table-actions"><button onClick={() => openEditProduct(product)}>Edit</button>{canDeleteProducts && <button className="danger-action" onClick={() => void deleteProduct(product)}>Delete</button>}</div></div>)}</div></div></section>}

        {activeTab === "orders" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Order management</h2><p>Review purchases and move each order through fulfilment.</p></div></div><div className="admin-panel table-panel"><div className="simple-table wide-table"><div className="table-header order-table-head"><span>ORDER</span><span>CUSTOMER</span><span>PLACED</span><span>TOTAL</span><span>PAYMENT</span><span>STATUS</span></div>{orders.map((order) => <div className="table-row order-table-row" key={order.id}><b>{order.orderNumber}<small>{order.itemCount} item(s)</small></b><span>{order.customerName}<small>{order.customerPhone} · {order.city}</small></span><span>{new Date(order.createdAt).toLocaleDateString()}</span><strong>{money(order.total)}</strong><span>{pretty(order.paymentMethod)}</span><select className="status-select" value={order.status} onChange={(event) => void setOrderStatus(order.id, event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></div>)}</div></div></section>}

        {activeTab === "inventory" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Inventory overview</h2><p>Live quantities from the product catalogue. Orders reduce stock automatically.</p></div></div><div className="inventory-grid">{activeProducts.map((product) => <div className="inventory-card" key={product.id}><div className="inventory-thumb"><Image src={product.imageUrls[0] || "/brand/eh-fabrics-icon.png"} alt={product.name} fill sizes="84px"/></div><div className="inventory-name"><b>{product.name}</b><small>{product.sku}</small></div><div className={`inventory-count ${product.stock <= 3 ? "low" : ""}`}><strong>{product.stock}</strong><small>available</small></div>{canWriteProducts && <button onClick={() => openEditProduct(product)}>Adjust ↗</button>}</div>)}</div></section>}

        {activeTab === "support" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Customer suit requests</h2><p>Help customers find a style that is not currently listed online.</p></div><Link href="/request-a-suit" target="_blank" className="panel-link">Open request form ↗</Link></div><div className="request-admin-grid">{requests.map((request) => <article className="request-admin-card" key={request.id}><div className="request-card-top"><span>{request.requestNumber}</span><StatusPill status={request.status}/></div><h3>{request.customerName}</h3><a href={`https://wa.me/${request.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Assalam-o-Alaikum ${request.customerName}, we received your E&H Fabrics suit request (${request.requestNumber}).`)}`} target="_blank" rel="noreferrer" className="request-phone">{request.phone} · WhatsApp ↗</a><p>{request.description}</p><div className="request-specs">{request.preferredColour && <span>Colour: {request.preferredColour}</span>}{request.fabricPreference && <span>Fabric: {request.fabricPreference}</span>}{request.budget ? <span>Budget: {money(request.budget)}</span> : null}{request.referenceImageUrl && <a href={request.referenceImageUrl} target="_blank" rel="noreferrer">View reference photograph ↗</a>}</div><label className="request-status-label">Update request status<select className="status-select" value={request.status} onChange={(event) => void setSupportStatus(request.id, event.target.value)}>{supportOptions.map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select></label></article>)}{requests.length === 0 && <p className="quiet-empty">No customer requests have arrived yet.</p>}</div></section>}

        {activeTab === "staff" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Staff & access</h2><p>Assign each team member only the permissions needed for their work.</p></div></div><div className="admin-panel"><div className="staff-intro"><div className="staff-shield">♙</div><div><b>Role-based access control</b><p>New team members should first create an account. An administrator can then assign their role here.</p></div></div><div className="staff-table">{staff.map((member) => <div className="staff-row" key={member.id}><div className="staff-avatar">{member.name.slice(0,1)}</div><div className="staff-info"><b>{member.name}</b><small>{member.email}</small></div><div className="staff-role-help"><b>{pretty(member.role)}</b><small>{roleDescriptions[member.role] || "Custom access"}</small></div><select value={member.role} className="status-select" onChange={(event) => void changeStaffRole(member.id, event.target.value)} disabled={member.id === initialUser.id}><option value="admin">Administrator</option><option value="manager">Manager</option><option value="catalog">Catalogue</option><option value="orders">Orders</option><option value="support">Support</option><option value="customer">Customer</option></select></div>)}</div><div className="staff-footnote">For the first administrator, create an account and promote its role using the documented bootstrap procedure before enabling production access.</div></div></section>}

        {activeTab === "settings" && <section className="admin-content"><div className="section-toolbar-admin"><div><h2>Store settings</h2><p>Configure delivery charges and customer contact details.</p></div></div><form className="admin-settings-form" onSubmit={saveSettings}><div className="admin-panel"><h3>Delivery rules</h3><p>These rules are applied by the backend when a customer places an order.</p><div className="form-grid"><label>Standard delivery fee (PKR)<input type="number" min="0" value={settings.deliveryFee} onChange={(event) => setSettings({ ...settings, deliveryFee: Number(event.target.value) })}/></label><label>Free delivery threshold (PKR)<input type="number" min="0" value={settings.freeDeliveryThreshold} onChange={(event) => setSettings({ ...settings, freeDeliveryThreshold: Number(event.target.value) })}/><small>Set to 0 to disable free delivery.</small></label></div></div><div className="admin-panel"><h3>Customer contact</h3><div className="form-grid"><label>WhatsApp number<input value={settings.whatsappNumber} onChange={(event) => setSettings({ ...settings, whatsappNumber: event.target.value })} placeholder="92xxxxxxxxxx"/></label><label>Store phone<input value={settings.storePhone} onChange={(event) => setSettings({ ...settings, storePhone: event.target.value })}/></label><label className="form-span">Store email<input type="email" value={settings.storeEmail} onChange={(event) => setSettings({ ...settings, storeEmail: event.target.value })}/></label><label className="form-span">Bank transfer instructions<textarea rows={3} value={settings.bankTransferInstructions} onChange={(event) => setSettings({ ...settings, bankTransferInstructions: event.target.value })}/></label></div></div><button className="admin-primary-button" type="submit">Save store settings</button></form></section>}
      </main>
      {modalOpen && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <form className="product-modal" onSubmit={saveProduct}>
          <div className="modal-heading"><div><span className="eyebrow">CATALOGUE MANAGEMENT</span><h2>{editing ? "Edit product" : "Add a new product"}</h2></div><button type="button" className="modal-close" onClick={() => setModalOpen(false)}>×</button></div>
          <div className="form-grid">
            <label>Product name<input name="name" required defaultValue={editing?.name ?? ""} placeholder="e.g. Style 01"/></label>
            <label>SKU<input name="sku" required defaultValue={editing?.sku ?? ""} placeholder="EH-3000-001"/></label>
            <label>Price (PKR)<input name="price" type="number" min="1" required defaultValue={editing?.price ?? 3000}/></label>
            <label>Stock quantity<input name="stock" type="number" min="0" required defaultValue={editing?.stock ?? 0}/></label>
            <label>Category<select name="category" defaultValue={editing?.category ?? "PKR 3,000"}><option>Embroidered suits</option><option>Printed suits</option><option>Premium suits</option><option>Unstitched suits</option><option>PKR 2,800</option><option>PKR 3,000</option><option>PKR 3,500</option><option>PKR 4,500</option></select></label>
            <label>Fabric<input name="fabric" defaultValue={editing?.fabric ?? ""} placeholder="Add verified details only"/></label>
            <label>Colour<input name="colour" defaultValue={editing?.colour ?? ""} placeholder="Add verified details only"/></label>
            <label>Pieces<input name="pieces" type="number" min="0" max="10" defaultValue={editing?.pieces ?? 0}/></label>
            <label className="form-span">Collection<input name="collection" defaultValue={editing?.collection ?? ""}/></label>
            <label className="form-span">Description<textarea name="description" rows={3} defaultValue={editing?.description ?? ""}/></label>
            <label className="form-span">Product image URLs<input name="imageUrls" defaultValue={editing?.imageUrls.join(", ") ?? ""} placeholder="Paste one or more image URLs, separated by commas"/><small>Use /suits/... or /products/... paths or HTTPS Cloudinary URLs.</small></label>
            <label className="form-span">Or upload product photographs<input name="imageFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>{uploading ? "Uploading images…" : "Select multiple JPG, PNG or WebP images · maximum 6 MB each"}</small></label>
            <label className="form-span">Tags (comma separated)<input name="tags" defaultValue={editing?.tags.join(", ") ?? ""} placeholder="new arrival"/></label>
            <label>Status<select name="status" defaultValue={editing?.status ?? "active"}><option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
            <label className="checkbox-inline"><input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured ?? false}/> Feature on storefront</label>
          </div>
          <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="admin-primary-button" type="submit" disabled={saving || uploading}>{saving ? "Saving…" : editing ? "Save changes" : "Create product"}</button></div>
        </form>
      </div>}
    </div>
  );
}

function Metric({ label, value, note, icon }: { label: string; value: string; note: string; icon: string }) {
  return <div className="metric-card"><div className="metric-card-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}
function StatusPill({ status }: { status: string }) { return <span className={`status-pill status-${status}`}>{pretty(status)}</span>; }
