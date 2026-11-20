import "server-only";

import { getDatabase } from "@/lib/mongodb";
import { products, type Product } from "@/data/products";

type StoredProduct = Product & {
  createdAt?: string;
  updatedAt?: string;
};

function toProduct(document: StoredProduct & { _id?: unknown }): Product {
  return {
    id: document.id,
    name: document.name,
    price: document.price,
    salePrice: document.salePrice,
    isActive: document.isActive,
    category: document.category,
    image: document.image,
    backImage: document.backImage,
    description: document.description,
    colors: document.colors,
    sizes: document.sizes,
  };
}

export async function getProducts({ includeInactive = false }: { includeInactive?: boolean } = {}) {
  const database = await getDatabase();
  const storedProducts = await database
    .collection<StoredProduct>("products")
    .find({})
    .toArray();
  const storedById = new Map(storedProducts.map((product) => [product.id, product]));
  const builtInIds = new Set(products.map((product) => product.id));

  const mergedProducts = [
    ...products.map((builtIn) => {
      const stored = storedById.get(builtIn.id);
      return stored ? { ...builtIn, ...toProduct(stored) } : builtIn;
    }),
    ...storedProducts
      .filter((product) => !builtInIds.has(product.id))
      .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""))
      .map(toProduct),
  ];

  return includeInactive
    ? mergedProducts
    : mergedProducts.filter((product) => product.isActive !== false);
}

export async function getProductById(id: string, { includeInactive = false }: { includeInactive?: boolean } = {}) {
  const catalog = await getProducts({ includeInactive });
  return catalog.find((product) => product.id === id);
}
