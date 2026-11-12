"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart-context";
import { getProductDisplayName } from "@/lib/product-presentation";

export function ProductDetailClient({ product, whatsappNumber }: { product: Product; whatsappNumber?: string }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  const zoomCloseRef = useRef<HTMLButtonElement>(null);
  const displayName = getProductDisplayName(product);
  const image = imageError ? "/brand/eh-fabrics-icon.png" : product.imageUrls[selectedImage] || product.imageUrls[0] || "/brand/eh-fabrics-icon.png";
  const message = `Assalam-o-Alaikum, I am interested in ${displayName} for PKR ${product.price.toLocaleString("en-PK")}. Please share availability and ordering details.`;
  const whatsappHref = `https://wa.me/${(whatsappNumber || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  const canOrder = product.stock > 0;
  const addToBag = () => {
    for (let index = 0; index < quantity; index++) {
      addItem({ productId: product.id, name: displayName, slug: product.slug, sku: product.sku, price: product.price, imageUrl: image });
    }
    setAdded(true);
  };

  useEffect(() => {
    if (!zoomed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    zoomCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      zoomTriggerRef.current?.focus();
    };
  }, [zoomed]);

  return (
    <main className={product.sku.startsWith("EH-") ? "subpage-shell catalog-product-page" : "subpage-shell"}>
      <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/products">Shop</Link><span>/</span><span>{displayName}</span></div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <div className={`detail-main-image ${imageReady ? "image-ready" : ""}`}><button ref={zoomTriggerRef} className="detail-zoom-trigger" type="button" onClick={() => setZoomed(true)} aria-label={`Enlarge ${displayName} photograph`}><Image src={image} onLoad={() => setImageReady(true)} onError={() => { setImageError(true); setImageReady(true); }} alt={displayName} fill priority sizes="(max-width: 800px) 100vw, 55vw" className={imageReady ? "is-loaded" : ""} /><span>Tap to enlarge</span></button></div>
          {product.imageUrls.length > 1 && <div className="detail-thumbs">{product.imageUrls.map((url, index) => <button key={url} className={selectedImage === index ? "active" : ""} onClick={() => { setSelectedImage(index); setImageError(false); setImageReady(false); }} aria-label={`Show image ${index + 1}`} aria-pressed={selectedImage === index}><Image src={url} alt={`${displayName} image ${index + 1}`} fill sizes="100px" /></button>)}</div>}
        </div>
        <div className="detail-copy"><div className="eyebrow"><span/> E&H SELECT</div><div className="product-category">{product.collection || product.category}</div><h1>{displayName}</h1><div className="detail-price">PKR {product.price.toLocaleString("en-PK")}</div><div className="detail-rule"/><p>{product.description}</p><div className="detail-specs"><div><span>Fabric</span><b>{product.fabric || "Details to be confirmed"}</b></div><div><span>Colour</span><b>{product.colour || "As pictured"}</b></div><div><span>Set</span><b>{product.pieces > 0 ? `${product.pieces}-piece suit` : "Details to be confirmed"}</b></div><div><span>Availability</span><b>{canOrder ? "In stock" : "Please contact us"}</b></div></div>
          {canOrder && <div className="quantity-selector" aria-label="Quantity selector"><span>Quantity</span><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">−</button><output>{quantity}</output><button type="button" onClick={() => setQuantity((value) => Math.min(Math.min(product.stock, 10), value + 1))} disabled={quantity >= Math.min(product.stock, 10)} aria-label="Increase quantity">+</button></div>}
          <button className="button button-dark button-full" aria-live="polite" disabled={!canOrder} onClick={addToBag}>{added ? "Added to your bag ✓" : canOrder ? "Add to bag" : "Check availability to order"}</button>
          <button className="button button-outline button-full" disabled={!canOrder} onClick={() => { addToBag(); router.push("/checkout"); }}>Buy now</button>
          <a className="button button-outline button-full" href={whatsappNumber ? whatsappHref : "/request-a-suit"} target={whatsappNumber ? "_blank" : undefined} rel={whatsappNumber ? "noreferrer" : undefined}>{whatsappNumber ? "Ask about this suit on WhatsApp ↗" : "Ask about availability ↗"}</a>
          <p className="detail-note">Stock, product details and matching gallery photographs have not yet been confirmed. Contact us before ordering.</p><Link href="/request-a-suit" className="text-link text-link-dark">Request a similar design ↗</Link>
        </div>
      </div>
      {zoomed && <div className="image-zoom-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setZoomed(false); }}><div className="image-zoom-dialog" role="dialog" aria-modal="true" aria-label={`${displayName} enlarged photograph`}><button ref={zoomCloseRef} type="button" className="image-zoom-close" onClick={() => setZoomed(false)} aria-label="Close enlarged image">×</button><Image src={image} onError={() => setImageError(true)} alt={displayName} fill sizes="95vw" priority /></div></div>}
    </main>
  );
}
