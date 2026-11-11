import type { Metadata } from "next";
import { listProducts } from "@/lib/repositories/products";
import { ShopListing } from "@/components/shop-listing";

export const metadata: Metadata = { title: "Shop the collection" };
export const dynamic = "force-dynamic";
export default async function ProductsPage() {
  const products = await listProducts();
  return <ShopListing products={products} />;
}
