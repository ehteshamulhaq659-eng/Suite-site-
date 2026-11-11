"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";

export function ProductDetailClient({ product, whatsappNumber }: { product: Product; whatsappNumber?: string }) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const image = product.imageUrls[selectedImage] || product.imageUrls[0] || "/brand/eh-fabrics-icon.png";
  const message = `Assalam-o-Alaikum, I am interested in ${product.name} (${product.sku}) for PKR ${product.price.toLocaleString("en-PK")}. Please share availability and ordering details.`;
  const whatsappHref = `https://wa.me/${(whatsappNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <main className="subpage-shell">
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/products">Shop</Link><span>/</span><span>{product.name}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery"><div className="detail-main-image"><Image src={image} alt={product.name} fill priority sizes="(max-width: 800px) 100vw, 55vw" /></div><div className="detail-thumbs">{product.imageUrls.map((url, index) => <button key={url} className={selectedImage === index ? "active" : ""} onClick={() => setSelectedImage(index)}><Image src={url} alt={`${product.name} image ${index + 1}`} fill sizes="100px" /></button>)}</div></div>
        <div className="detail-copy"><div className="eyebrow"><span/> E&H SELECT</div><div className="product-category">{product.collection || product.category}</div><h1>{product.name}</h1><div className="detail-price">PKR {product.price.toLocaleString("en-PK")}</div><div className="detail-rule"/><p>{product.description}</p><div className="detail-specs"><div><span>Fabric</span><b>{product.fabric || "As described"}</b></div><div><span>Colour</span><b>{product.colour || "As pictured"}</b></div><div><span>Set</span><b>{product.pieces}-piece suit</b></div><div><span>Availability</span><b>{product.stock > 0 ? "In stock" : "Out of stock"}</b></div></div><button className="button button-dark button-full" disabled={product.stock <= 0} onClick={() => { addItem({ productId: product.id, name: product.name, slug: product.slug, sku: product.sku, price: product.price, imageUrl: image }); setAdded(true); }}>{added ? "Added to your bag ✓" : "Add to bag"}</button><a className="button button-outline button-full" href={whatsappHref} target="_blank" rel="noreferrer">Ask about this suit on WhatsApp ↗</a><p className="detail-note">Delivery charges are calculated at checkout. Need a closer look or a different colour? Our team can help.</p><Link href="/request-a-suit" className="text-link text-link-dark">Request a similar design ↗</Link></div>
      </div>
    </main>
  );
}
