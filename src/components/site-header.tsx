"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";

export function SiteHeader() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="announcement-bar">COMPLIMENTARY DELIVERY ON ORDERS ABOVE PKR 8,000 <span>·</span> MADE FOR YOUR MOMENTS</div>
      <header className="site-header">
        <button className="mobile-menu-toggle" aria-label="Open navigation" onClick={() => setMenuOpen((open) => !open)}><span/><span/></button>
        <Link href="/" className="brand-lockup" aria-label="E&H Fabrics home">
          <Image src="/brand/eh-fabrics-primary.svg" alt="E&H Fabrics" width={190} height={74} priority />
        </Link>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <Link href="/products" onClick={() => setMenuOpen(false)}>Shop all</Link>
          <Link href="/products?collection=The%20Premium%20Edit" onClick={() => setMenuOpen(false)}>Premium edit</Link>
          <Link href="/request-a-suit" onClick={() => setMenuOpen(false)}>Request a suit</Link>
          <Link href="/#our-story" onClick={() => setMenuOpen(false)}>Our story</Link>
        </nav>
        <div className="header-actions">
          <Link href="/account" className="header-icon-link" aria-label="My account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.5 3.1-5.4 7-5.4s6.4 1.9 7 5.4"/></svg></Link>
          <Link href="/checkout" className="bag-link" aria-label={`Shopping bag, ${count} items`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg><span>Bag</span><b>{count}</b></Link>
        </div>
      </header>
    </>
  );
}
