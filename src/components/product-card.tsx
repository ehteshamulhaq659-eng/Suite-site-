"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";
import { getProductDisplayName } from "@/lib/product-presentation";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const imageUrl = product.imageUrls[0] || "/brand/eh-fabrics-icon.png";
  const [imageSource, setImageSource] = useState(imageUrl);
  const displayName = getProductDisplayName(product);
  return (
    <article className="product-card" data-reveal>
      <div className={`product-image-wrap ${imageReady ? "image-ready" : ""}`}>
        <Link href={`/products/${product.slug}`} className="product-image-link" aria-label={`View ${displayName}`}>
          <Image src={imageSource} onLoad={() => setImageReady(true)} onError={() => { setImageSource("/brand/eh-fabrics-icon.png"); setImageReady(true); }} alt={`${displayName} ladies' suit`} fill sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw" className={`product-image product-image-contained ${imageReady ? "is-loaded" : ""}`} />
        </Link>
        {product.isFeatured && <span className="product-badge">E&H select</span>}
        <button className={`wishlist-button ${saved ? "is-saved" : ""}`} onClick={() => setSaved((value) => !value)} aria-pressed={saved} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}>{saved ? "♥" : "♡"}</button>
        {product.stock > 0 ? (
          <button className={`quick-add ${added ? "is-added" : ""}`} aria-live="polite" onClick={() => { addItem({ productId: product.id, name: displayName, slug: product.slug, sku: product.sku, price: product.price, imageUrl }); setAdded(true); window.setTimeout(() => setAdded(false), 1400); }}>{added ? "Added to bag ✓" : "Add to bag +"}</button>
        ) : (
          <Link href={`/products/${product.slug}`} className="quick-add">Check availability ↗</Link>
        )}
      </div>
      <div className="product-meta"><div><span className="product-category">{product.category}</span><Link href={`/products/${product.slug}`} className="product-name">{displayName}</Link></div><strong>PKR {product.price.toLocaleString("en-PK")}</strong></div>
      <div className="product-footnote">{product.pieces > 0 ? `${product.pieces}-piece suit` : "Product details to be confirmed"} {product.stock > 0 && product.stock <= 3 ? <span className="stock-note">Only {product.stock} left</span> : null}</div>
    </article>
  );
}
