"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/product-card";

export function ShopListing({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [sort, setSort] = useState("featured");
  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    const list = products.filter((product) => (category === "All pieces" || product.category === category) && (!term || `${product.name} ${product.colour} ${product.fabric} ${product.category}`.toLowerCase().includes(term)));
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, category, sort]);
  return <main className="subpage-shell shop-page"><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Shop all</span></div><div className="shop-title-row"><div><div className="eyebrow"><span/> THE E&H COLLECTION</div><h1>Find your <em>favourite.</em></h1><p>A considered edit of ladies’ suits, selected with care.</p></div><div className="shop-count">{filtered.length} pieces<br/><span>Ready to explore</span></div></div><div className="shop-controls"><label className="search-field"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search colour, style or fabric"/></label><div className="filter-tabs">{["All pieces", "Embroidered suits", "Printed suits", "Premium suits"].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select></div><div className="product-grid shop-product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product}/>)}</div>{filtered.length === 0 && <div className="empty-state">No pieces found. <Link href="/request-a-suit">Ask us to find one for you ↗</Link></div>}<div className="shop-support-note"><span>✳</span><div><b>Looking for a particular suit?</b><p>Share a reference photo or describe the style. We’ll help you find a close match.</p></div><Link href="/request-a-suit" className="text-link text-link-dark">Make a request ↗</Link></div></main>;
}
