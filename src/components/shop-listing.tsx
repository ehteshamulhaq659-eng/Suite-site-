"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export function ShopListing({ products, initialPrice }: { products: Product[]; initialPrice?: number }) {
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState<number | null>(initialPrice ?? null);
  const [sort, setSort] = useState("featured");
  const prices = Array.from(new Set(products.map((product) => product.price))).sort((a, b) => a - b);
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    const list = products.filter((product) => (price === null || product.price === price) && (!term || `${product.name} ${product.sku} ${product.colour} ${product.fabric} ${product.category}`.toLowerCase().includes(term)));
    if (sort === "featured") list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, price, sort]);
  return <main className="subpage-shell shop-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Shop all</span></div><div className="shop-title-row"><div><div className="eyebrow"><span/> THE E&H COLLECTION</div><h1>Find your <em>favourite.</em></h1><p>Browse photographed ladies’ suits by the price supplied for each collection.</p></div><div className="shop-count">{filtered.length} pieces<br/><span>Ready to explore</span></div></div><div className="shop-controls"><label className="search-field"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input id="shop-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by price or detail" aria-label="Search products"/></label><div className="filter-tabs"><button className={price === null ? "active" : ""} onClick={() => setPrice(null)}>All pieces</button>{prices.map((item) => <button key={item} className={price === item ? "active" : ""} onClick={() => setPrice(item)}>Rs. {item.toLocaleString("en-PK")}</button>)}</div><select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></div><div className="product-grid shop-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{filtered.length === 0 && <div className="empty-state">No pieces found. <Link href="/request-a-suit">Ask us to find one for you ↗</Link></div>}<div className="shop-support-note"><span>✳</span><div><b>Looking for a particular suit?</b><p>Share a reference photo or describe the style. We’ll help you find a close match.</p></div><Link href="/request-a-suit" className="text-link text-link-dark">Make a request ↗</Link></div></main>;
}
