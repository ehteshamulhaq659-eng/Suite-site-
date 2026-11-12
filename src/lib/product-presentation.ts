type ProductLabel = { name: string; sku: string };

const catalogSkuPattern = /^EH-\d{4}-(\d{3})$/;

export function getProductDisplayName(product: ProductLabel): string {
  const match = product.name === product.sku ? product.sku.match(catalogSkuPattern) : null;
  return match ? `Style ${Number(match[1]).toString().padStart(2, "0")}` : product.name;
}
