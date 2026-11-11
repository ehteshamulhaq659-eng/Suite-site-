"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();
type CustomerOrder = { id: string; orderNumber: string; total: number; status: string; paymentMethod: string; createdAt: string; itemCount: number };

export function AccountClient({ isDemo }: { isDemo: boolean }) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const role = session?.user ? ((session.user as { role?: string }).role || "customer") : "customer";

  useEffect(() => {
    if (session?.user) {
      void fetch("/api/account/orders", { cache: "no-store" }).then(async (response) => { const result = await response.json(); if (response.ok) setOrders(result.data ?? []); });
    }
  }, [session?.user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });
      if (result.error) throw new Error(result.error.message || "Authentication failed.");
      await refetch();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }

  async function signOut() { await authClient.signOut(); await refetch(); }

  if (isDemo) return <main className="subpage-shell account-page"><div className="account-card"><div className="eyebrow"><span/> E&H CLIENT ACCOUNT</div><h1>Your E&H <em>account.</em></h1><p>Customer accounts become available when your Neon database and authentication are connected. You can preview the store and checkout in demo mode.</p><Link href="/products" className="button button-dark">Explore the collection ↗</Link></div></main>;
  if (isPending) return <main className="subpage-shell account-page"><p>Loading your account…</p></main>;
  if (session?.user) return <main className="subpage-shell account-page"><div className="account-dashboard"><div className="account-card account-card-wide"><div className="eyebrow"><span/> WELCOME BACK</div><h1>Good to see<br/><em>you again.</em></h1><p>Signed in as <b>{session.user.email}</b></p><div className="account-actions"><Link href="/products" className="button button-dark">Explore the collection ↗</Link>{role !== "customer" && <Link href="/admin" className="button button-outline">Open store workspace ↗</Link>}<button className="button button-outline" onClick={() => void signOut()}>Sign out</button></div></div><div className="account-orders"><div className="eyebrow"><span/> YOUR PURCHASES</div><h2>Order history</h2>{orders.length === 0 ? <p className="quiet-empty">Your orders will appear here once you place an order while signed in.</p> : orders.map((order) => <div className="account-order-row" key={order.id}><div><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString()} · {order.itemCount} item(s)</small></div><div><strong>PKR {order.total.toLocaleString("en-PK")}</strong><small>{order.status.replaceAll("_", " ")}</small></div></div>)}</div></div></main>;

  return <main className="subpage-shell account-page"><div className="account-card"><div className="eyebrow"><span/> E&H CLIENT ACCOUNT</div><h1>{mode === "signin" ? <>Welcome <em>back.</em></> : <>Join the <em>E&H edit.</em></>}</h1><p>{mode === "signin" ? "Sign in to view your orders and keep your favourite pieces close." : "Create an account to keep track of orders and saved pieces."}</p><form className="account-form" onSubmit={handleSubmit}>{mode === "signup" && <label>Your name<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Full name"/></label>}<label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com"/></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} placeholder="At least 10 characters"/></label>{error && <div className="form-message error">{error}</div>}<button className="button button-dark button-full" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form><button className="account-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>{mode === "signin" ? "New to E&H? Create an account" : "Already have an account? Sign in"}</button></div></main>;
}
