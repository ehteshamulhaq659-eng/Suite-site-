import type { Metadata } from "next";
import { listProducts } from "@/lib/repositories/products";
import { ShopListing } from "@/components/shop-listing";

export const metadata: Metadata = { title: "Shop the collection" };
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ price?: string }> };
export default async function ProductsPage({ searchParams }: Props) {
  const products = await listProducts();
  const params = await searchParams;
  const requestedPrice = Number(params.price);
  const initialPrice = [2800, 3000, 3500, 4500].includes(requestedPrice) ? requestedPrice : undefined;
  return <ShopListing products={products} initialPrice={initialPrice} />;
}
