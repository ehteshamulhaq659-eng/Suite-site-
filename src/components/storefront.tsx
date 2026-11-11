"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";

const filters = ["All pieces", "Embroidered suits", "Printed suits", "Premium suits"];

export function Storefront({ products }: { products: Product[] }) {
  const [activeFilter, setActiveFilter] = useState("All pieces");
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeFilter === "All pieces" || product.category === activeFilter;
    const term = query.trim().toLowerCase();
    const matchesSearch = !term || [product.name, product.colour, product.fabric, product.category].join(" ").toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  }), [products, activeFilter, query]);
  const featured = products.filter((product) => product.isFeatured).slice(0, 3);

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span/> THE ART OF DRESSING WELL</div>
          <h1>Elegance,<br/><em>in every thread.</em></h1>
          <p>Thoughtfully selected ladies’ suits, rich in detail and made for the moments that matter.</p>
          <div className="hero-actions"><Link href="/products" className="button button-dark">Explore the collection <span>↗</span></Link><Link href="/request-a-suit" className="text-link">Looking for something special?</Link></div>
          <div className="hero-note"><span className="hero-note-line"/><span>THE E&H EDIT · 2026</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame"><Image src="/products/suit-01.webp" alt="E&H emerald ladies suit collection" fill priority sizes="(max-width: 800px) 100vw, 52vw" className="hero-image" /></div>
          <div className="hero-visual-caption"><span>01 / SIGNATURE COLLECTION</span><span>THE DETAILS MATTER</span></div>
          <div className="hero-stamp"><span>CURATED</span><b>WITH</b><span>CARE</span></div>
        </div>
        <div className="hero-side-label">E&H FABRICS — PAKISTAN</div>
      </section>

      <section className="service-strip" aria-label="Store benefits"><div><span className="service-icon">✳</span><span><b>Curated collections</b><small>Selected with care</small></span></div><div><span className="service-icon">◇</span><span><b>Easy ordering</b><small>Website or WhatsApp</small></span></div><div><span className="service-icon">✧</span><span><b>Personal assistance</b><small>Here when you need us</small></span></div><div><span className="service-icon">⌁</span><span><b>Delivery arrangements</b><small>Clear charges at checkout</small></span></div></section>

      <section className="collection-section section-shell" id="collection">
        <div className="section-heading"><div><div className="eyebrow"><span/> DISCOVER YOUR NEXT FAVOURITE</div><h2>Pieces worth <em>keeping.</em></h2></div><p>From everyday favourites to statement designs, find a look that feels like you.</p></div>
        <div className="collection-toolbar"><div className="filter-tabs">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find your style" aria-label="Search suits"/></label></div>
        <div className="product-grid">{visibleProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        {visibleProducts.length === 0 && <div className="empty-state">No suits match that search. Try another colour or collection.</div>}
        {visibleProducts.length > 8 && <div className="center-action"><Link href="/products" className="button button-outline">View the full collection <span>↗</span></Link></div>}
      </section>

      <section className="editorial-section">
        <div className="editorial-image"><Image src="/products/suit-10.webp" alt="Premium E&H suit collection" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="editorial-copy"><div className="eyebrow eyebrow-light"><span/> THE PREMIUM EDIT</div><h2>For days that<br/><em>deserve a little more.</em></h2><p>Beautiful colour stories, considered details and refined finishing. Discover pieces with a little extra presence.</p><Link href="/products?collection=The%20Premium%20Edit" className="button button-light">Explore premium edit <span>↗</span></Link><div className="editorial-index">E&H / COLLECTION 03</div></div>
      </section>

      <section className="story-section section-shell" id="our-story"><div className="story-mark">E<span>&</span>H</div><div className="story-copy"><div className="eyebrow"><span/> A LITTLE ABOUT US</div><h2>Good style is<br/><em>in the details.</em></h2><p>At E&H Fabrics, we believe the right suit is more than a purchase. It is colour, comfort, craft and confidence coming together. Our collections are selected to bring thoughtful design within reach.</p><Link href="/request-a-suit" className="text-link text-link-dark">Tell us what you’re looking for <span>↗</span></Link></div></section>

      <section className="request-banner"><div className="request-banner-deco">✳</div><div className="eyebrow eyebrow-light"><span/> A PERSONAL REQUEST</div><h2>Can't find the suit<br/><em>you have in mind?</em></h2><p>Send us a picture or describe the look. Our team will help you find a close match.</p><Link href="/request-a-suit" className="button button-light">Request a suit <span>↗</span></Link></section>

      <section className="newsletter-note"><div className="eyebrow"><span/> THE E&H PROMISE</div><h2>Wear elegance.<br/><em>Live in style.</em></h2><p>Thoughtful pieces, a personal touch, and a little more beauty in the everyday.</p></section>
    </main>
  );
}
