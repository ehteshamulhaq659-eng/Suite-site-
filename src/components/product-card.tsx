"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const imageUrl = product.imageUrls[0] || "/brand/eh-fabrics-icon.png";
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`View ${product.name}`}>
          <Image src={imageUrl} alt={`${product.name} ladies suit`} fill sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw" className="product-image" />
        </Link>
        {product.isFeatured && <span className="product-badge">E&H select</span>}
        <button className={`wishlist-button ${saved ? "is-saved" : ""}`} onClick={() => setSaved((value) => !value)} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>{saved ? "♥" : "♡"}</button>
        {product.stock > 0 ? (
          <button className="quick-add" onClick={() => { addItem({ productId: product.id, name: product.name, slug: product.slug, sku: product.sku, price: product.price, imageUrl }); setAdded(true); window.setTimeout(() => setAdded(false), 1400); }}>{added ? "Added to bag ✓" : "Add to bag +"}</button>
        ) : (
          <Link href={`/products/${product.slug}`} className="quick-add">Check availability ↗</Link>
        )}
      </div>
      <div className="product-meta"><div><span className="product-category">{product.category}</span><Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link></div><strong>PKR {product.price.toLocaleString("en-PK")}</strong></div>
      <div className="product-footnote">{product.pieces}-piece · {product.fabric || "Unstitched"} {product.stock <= 3 && product.stock > 0 ? <span className="stock-note">Only {product.stock} left</span> : null}</div>
    </article>
  );
}
