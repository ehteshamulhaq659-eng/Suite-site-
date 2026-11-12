import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProductBySlug } from "@/lib/repositories/products";
import { getStoreSettings } from "@/lib/repositories/settings";
import { getProductDisplayName } from "@/lib/product-presentation";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: getProductDisplayName(product), description: product.description } : { title: "Product not found" };
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const settings = await getStoreSettings();
  return <ProductDetailClient product={product} whatsappNumber={settings.whatsappNumber} />;
}
