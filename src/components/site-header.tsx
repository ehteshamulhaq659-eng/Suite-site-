"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <div className="announcement-bar">E&H FABRICS <span>·</span> LADIES’ SUITS</div>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <button className={`mobile-menu-toggle ${menuOpen ? "is-open" : ""}`} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span/><span/></button>
        <Link href="/" className="brand-lockup" aria-label="E&H Fabrics home">
          <Image src="/brand/eh-fabrics-primary.svg" alt="E&H Fabrics" width={190} height={74} />
        </Link>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <Link href="/" className={pathname === "/" ? "is-active" : undefined} aria-current={pathname === "/" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/products" className={pathname.startsWith("/products") ? "is-active" : undefined} aria-current={pathname.startsWith("/products") ? "page" : undefined} onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link href="/#new-arrivals" onClick={() => setMenuOpen(false)}>New arrivals</Link>
          <Link href="/#collections" onClick={() => setMenuOpen(false)}>Collections</Link>
          <Link href="/#our-story" onClick={() => setMenuOpen(false)}>About us</Link>
          <Link href="/request-a-suit" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link className="nav-mobile-only" href="/products#shop-search" onClick={() => setMenuOpen(false)}>Search</Link>
          <Link className="nav-mobile-only" href="/account" onClick={() => setMenuOpen(false)}>Customer account</Link>
        </nav>
        <div className="header-actions">
          <Link href="/products#shop-search" className="header-icon-link" aria-label="Search products"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></Link>
          <Link href="/account" className="header-icon-link" aria-label="My account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.6-3.5 3.1-5.4 7-5.4s6.4 1.9 7 5.4"/></svg></Link>
          <Link href="/checkout" className="bag-link" aria-label={`Shopping bag, ${count} items`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg><span>Bag</span><b key={count} className="bag-count">{count}</b></Link>
        </div>
      </header>
    </>
  );
}
