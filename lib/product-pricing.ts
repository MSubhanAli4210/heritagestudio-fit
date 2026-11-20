import type { Product } from "@/data/products";

export function getProductPrice(product: Pick<Product, "price" | "salePrice">) {
  const salePrice = product.salePrice;
  return typeof salePrice === "number" && salePrice > 0 && salePrice < product.price
    ? salePrice
    : product.price;
}

export function getSalePercent(product: Pick<Product, "price" | "salePrice">) {
  const salePrice = getProductPrice(product);
  return salePrice < product.price
    ? Math.round((1 - salePrice / product.price) * 100)
    : 0;
}
