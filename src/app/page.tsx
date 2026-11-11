import { Storefront } from "@/components/storefront";
import { listProducts } from "@/lib/repositories/products";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const products = (await listProducts()).filter((product) => product.status === "active");
  return <Storefront products={products} />;
}
