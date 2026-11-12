"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";
import { getProductDisplayName } from "@/lib/product-presentation";

export function Storefront({ products }: { products: Product[] }) {
  const prices = [2800, 3000, 3500, 4500];
  const [activePrice, setActivePrice] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesPrice = activePrice === null || product.price === activePrice;
    const term = query.trim().toLowerCase();
    const matchesSearch = !term || [product.name, product.sku, product.colour, product.fabric, product.category].join(" ").toLowerCase().includes(term);
    return matchesPrice && matchesSearch;
  }), [products, activePrice, query]);
  const featured = visibleProducts.filter((product) => product.isFeatured).slice(0, 8);
  const newArrivals = [...products]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 4);
  const heroProduct = products.find((product) => product.price === 3500) ?? products[0];
  const premiumProduct = products.find((product) => product.price === 4500) ?? products[0];

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span/> THE ART OF DRESSING WELL</div>
          <h1>Elegance<br/><em>Woven Into</em><br/><em>Every Thread</em></h1>
          <p>Discover beautiful ladies’ suits, thoughtfully selected for your everyday elegance and special occasions.</p>
          <div className="hero-actions"><Link href="/products" className="button button-dark">Shop collection <span>↗</span></Link><Link href="/#new-arrivals" className="text-link">Explore new arrivals</Link></div>
          <div className="hero-note"><span className="hero-note-line"/><span>THE E&H EDIT · 2026</span></div>
        </div>
        <div className="hero-visual">
          {heroProduct && <div className="hero-image-frame"><Image src={heroProduct.imageUrls[0]} alt={`${getProductDisplayName(heroProduct)} ladies' suit`} fill priority sizes="(max-width: 800px) 100vw, 52vw" className="hero-image" /></div>}
          <div className="hero-visual-caption"><span>E&H FABRICS / SUIT COLLECTION</span><span>THE DETAILS MATTER</span></div>
          <div className="hero-stamp"><span>CURATED</span><b>WITH</b><span>CARE</span></div>
        </div>
        <div className="hero-side-label">E&H FABRICS — PAKISTAN</div>
      </section>

      <section className="service-strip" aria-label="Store benefits" data-reveal><div><span className="service-icon">✳</span><span><b>Curated collections</b><small>Selected with care</small></span></div><div><span className="service-icon">◇</span><span><b>Flexible payment</b><small>Cash on Delivery or bank transfer</small></span></div><div><span className="service-icon">✧</span><span><b>Personal assistance</b><small>Orders confirmed by our team</small></span></div><div><span className="service-icon">⌁</span><span><b>Clear delivery charges</b><small>Shown at checkout</small></span></div></section>

      <section className="price-collections section-shell" id="collections" data-reveal>
        <div className="section-heading"><div><div className="eyebrow"><span/> SHOP BY PRICE</div><h2>Find your <em>price point.</em></h2></div><p>Browse the supplied suit collections by their listed price.</p></div>
        <div className="price-grid">{prices.map((price) => {
          const product = products.find((item) => item.price === price);
          if (!product) return null;
          return <Link href={`/products?price=${price}`} className="price-tile" key={price} data-reveal>
            <div className="price-tile-image"><Image src={product.imageUrls[0]} alt={`Suit in the Rs. ${price.toLocaleString("en-PK")} collection`} fill sizes="(max-width: 680px) 50vw, 25vw" /></div>
            <span>EXPLORE THE COLLECTION</span><strong>Rs. {price.toLocaleString("en-PK")}</strong><i>View suits ↗</i>
          </Link>;
        })}</div>
      </section>

      <section className="collection-section section-shell" id="collection" data-reveal>
        <div className="section-heading"><div><div className="eyebrow"><span/> FEATURED IN THE COLLECTION</div><h2>Pieces worth <em>keeping.</em></h2></div><p>Shop photographed styles at their folder-listed prices. Product details are confirmed with our team.</p></div>
        <div className="collection-toolbar"><div className="filter-tabs"><button className={activePrice === null ? "active" : ""} onClick={() => setActivePrice(null)}>All pieces</button>{prices.map((price) => <button key={price} className={activePrice === price ? "active" : ""} onClick={() => setActivePrice(price)}>Rs. {price.toLocaleString("en-PK")}</button>)}</div><label className="search-field" id="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by price or detail" aria-label="Search suits"/></label></div>
        <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        {featured.length === 0 && <div className="empty-state">No featured suits match that search. Browse the full collection to explore every style.</div>}
        {visibleProducts.length > featured.length && <div className="center-action"><Link href="/products" className="button button-outline">View the full collection <span>↗</span></Link></div>}
      </section>

      <section className="editorial-section" data-reveal>
        {premiumProduct && <div className="editorial-image"><Image src={premiumProduct.imageUrls[0]} alt={`${getProductDisplayName(premiumProduct)} from the Rs. 4,500 collection`} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>}
        <div className="editorial-copy"><div className="eyebrow eyebrow-light"><span/> THE RS. 4,500 COLLECTION</div><h2>For days that<br/><em>deserve a little more.</em></h2><p>Browse the supplied Rs. 4,500 suits and ask our team for confirmed product details and availability.</p><Link href="/products?price=4500" className="button button-light">Explore Rs. 4,500 suits <span>↗</span></Link><div className="editorial-index">E&H / PRICE COLLECTION</div></div>
      </section>

      <section className="new-arrivals-section section-shell" id="new-arrivals" data-reveal>
        <div className="section-heading"><div><div className="eyebrow"><span/> RECENTLY ADDED PHOTOGRAPHS</div><h2>New <em>arrivals.</em></h2></div><Link href="/products" className="text-link text-link-dark">Shop all suits ↗</Link></div>
        <div className="product-grid">{newArrivals.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>

      <section className="story-section section-shell" id="our-story" data-reveal><div className="story-mark">E<span>&</span>H</div><div className="story-copy"><div className="eyebrow"><span/> A LITTLE ABOUT US</div><h2>Good style is<br/><em>in the details.</em></h2><p>At E&H Fabrics, we believe the right suit is more than a purchase. It is colour, comfort, craft and confidence coming together. Our collections are selected to bring thoughtful design within reach.</p><Link href="/request-a-suit" className="text-link text-link-dark">Tell us what you’re looking for <span>↗</span></Link></div></section>

      <section className="request-banner" data-reveal><div className="request-banner-deco">✳</div><div className="eyebrow eyebrow-light"><span/> A PERSONAL REQUEST</div><h2>Can't find the suit<br/><em>you have in mind?</em></h2><p>Send us a picture or describe the look. Our team will help you find a close match.</p><Link href="/request-a-suit" className="button button-light">Request a suit <span>↗</span></Link></section>

      <section className="newsletter-note" data-reveal><div className="eyebrow"><span/> THE E&H PROMISE</div><h2>Wear elegance.<br/><em>Live in style.</em></h2><p>Thoughtful pieces, a personal touch, and a little more beauty in the everyday.</p></section>
    </main>
  );
}
