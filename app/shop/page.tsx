import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getProducts } from "@/lib/product-catalog";
import { getProductPrice, getSalePercent } from "@/lib/product-pricing";

async function ProductGrid() {
  const products = await getProducts();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => {
        const price = getProductPrice(product);
        return (
          <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-lg bg-card">
            <img src={product.image} alt={product.name} className="h-72 w-full bg-cloth object-contain p-5 transition-transform duration-300 group-hover:scale-105" />
            <div className="p-4">
              <p className="mb-1 text-[10px] font-bold tracking-[2px] text-accent">{product.category}</p>
              <h2 className="font-serif text-base">{product.name}</h2>
              <p className="mt-2 text-sm font-semibold">
                Rs. {price.toLocaleString("en-PK")}
                {price < product.price && (
                  <>
                    <span className="ml-2 text-xs font-normal text-muted line-through">
                      Rs. {product.price.toLocaleString("en-PK")}
                    </span>
                    <span className="ml-2 text-[10px] font-bold uppercase text-[#9a5137]">
                      {getSalePercent(product)}% off
                    </span>
                  </>
                )}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ShopPage() {
  return (
    <main>
      <Navbar />
      <section className="px-[7%] py-10 md:py-[60px]">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">THE COLLECTION</p>
        <h1 className="mb-8 mt-2 font-serif text-[clamp(36px,5vw,52px)]">Shop apparel</h1>
        <Suspense fallback={<p className="py-10 text-sm text-muted">Loading the collection…</p>}>
          <ProductGrid />
        </Suspense>
      </section>
    </main>
  );
}