"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart-context";

type CheckoutSettings = { deliveryFee: number; freeDeliveryThreshold: number; bankTransferInstructions: string };
export function CheckoutClient({ settings }: { settings: CheckoutSettings }) {
  const cart = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "bank_transfer">("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{ orderNumber: string; total: number; status: string; paymentMethod: string } | null>(null);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      customerName: String(form.get("customerName") || ""), customerEmail: String(form.get("customerEmail") || ""),
      customerPhone: String(form.get("customerPhone") || ""), addressLine1: String(form.get("addressLine1") || ""),
      addressLine2: String(form.get("addressLine2") || ""), city: String(form.get("city") || ""),
      province: String(form.get("province") || ""), postalCode: String(form.get("postalCode") || ""),
      paymentMethod, customerNote: String(form.get("customerNote") || ""),
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not place your order.");
      setOrder(result.data); cart.clearCart();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not place your order."); }
    finally { setSubmitting(false); }
  }

  if (order) return <main className="subpage-shell"><div className="order-success"><div className="success-mark">✓</div><div className="eyebrow"><span/> ORDER RECEIVED</div><h1>Thank you for<br/><em>choosing E&H.</em></h1><p>Your order <b>{order.orderNumber}</b> has been recorded. Our team will contact you to confirm the details.</p>{order.paymentMethod === "bank_transfer" && <div className="bank-instructions"><b>Bank transfer instructions</b><p>{settings.bankTransferInstructions}</p></div>}<div className="success-total"><span>Order total</span><b>PKR {order.total.toLocaleString("en-PK")}</b></div><Link href="/products" className="button button-dark">Continue shopping <span>↗</span></Link></div></main>;

  if (cart.items.length === 0) return <main className="subpage-shell"><div className="empty-cart"><div className="eyebrow"><span/> YOUR E&H BAG</div><h1>Your bag is<br/><em>waiting for you.</em></h1><p>There are no pieces in your bag just yet.</p><Link href="/products" className="button button-dark">Explore the collection <span>↗</span></Link></div></main>;

  const deliveryEstimate = settings.freeDeliveryThreshold > 0 && cart.subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
  return <main className="subpage-shell"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Checkout</span></div><div className="checkout-heading"><div className="eyebrow"><span/> YOUR E&H BAG</div><h1>Almost <em>yours.</em></h1><p>Share your delivery details and choose how you would like to pay.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={submitOrder}><h2>Delivery details</h2><div className="form-grid"><label>Full name<input name="customerName" required placeholder="Your full name"/></label><label>WhatsApp number<input name="customerPhone" required minLength={7} placeholder="03xx xxxxxxx"/></label><label className="form-span">Email address <span className="optional-label">optional</span><input name="customerEmail" type="email" placeholder="you@example.com"/></label><label className="form-span">Address<input name="addressLine1" required minLength={5} placeholder="House, street and area"/></label><label className="form-span">Address line 2 <span className="optional-label">optional</span><input name="addressLine2" placeholder="Apartment, floor, landmark"/></label><label>City<input name="city" required placeholder="City"/></label><label>Province<input name="province" placeholder="Province"/></label><label>Postal code <span className="optional-label">optional</span><input name="postalCode" placeholder="Postal code"/></label></div><h2 className="payment-title">Payment method</h2><label className={`payment-option ${paymentMethod === "cash_on_delivery" ? "selected" : ""}`}><input type="radio" checked={paymentMethod === "cash_on_delivery"} onChange={() => setPaymentMethod("cash_on_delivery")}/><span><b>Cash on Delivery</b><small>Pay when your order arrives.</small></span></label><label className={`payment-option ${paymentMethod === "bank_transfer" ? "selected" : ""}`}><input type="radio" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")}/><span><b>Bank Transfer</b><small>Our team will share transfer details during confirmation.</small></span></label><label>Order note <span className="optional-label">optional</span><textarea name="customerNote" rows={3} placeholder="Any delivery instructions or special notes?"/></label>{error && <div className="form-message error">{error}</div>}<button className="button button-dark button-full" type="submit" disabled={submitting}>{submitting ? "Placing your order…" : "Place order"}<span>↗</span></button><p className="form-privacy">Your order will be reviewed and confirmed by the E&H team.</p></form><aside className="order-summary"><h2>Order summary <span>{cart.count} items</span></h2>{cart.items.map((item) => <div className="summary-item" key={item.productId}><div className="summary-image"><Image src={item.imageUrl} alt={item.name} fill sizes="70px"/></div><div className="summary-info"><b>{item.name}</b><small>Qty {item.quantity}</small><button onClick={() => cart.removeItem(item.productId)}>Remove</button></div><strong>PKR {(item.price * item.quantity).toLocaleString("en-PK")}</strong></div>)}<div className="summary-totals"><div><span>Subtotal</span><b>PKR {cart.subtotal.toLocaleString("en-PK")}</b></div><div><span>Delivery</span><b>{deliveryEstimate === 0 ? "Complimentary" : `PKR ${deliveryEstimate.toLocaleString("en-PK")}`}</b></div><div className="summary-grand"><span>Estimated total</span><b>PKR {(cart.subtotal + deliveryEstimate).toLocaleString("en-PK")}</b></div></div></aside></div></main>;
}
