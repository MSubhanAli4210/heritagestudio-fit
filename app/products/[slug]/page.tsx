import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProductOptions from "@/components/products/ProductOptions";
import ProductGallery from "@/components/products/ProductGallery";
import { getProductById } from "@/lib/product-catalog";
import { getProductPrice, getSalePercent } from "@/lib/product-pricing";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<p className="px-[7%] py-16 text-sm text-muted">Loading product…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) notFound();
  const currentPrice = getProductPrice(product);
  const views = [
    { label: "Front", src: product.image },
    { label: "Back", src: product.backImage },
  ];

  return (
    <section className="grid gap-8 px-[7%] py-[60px] lg:grid-cols-2 lg:items-start lg:gap-12">
      <ProductGallery name={product.name} views={views} />

      <div>
        <p className="text-[10px] font-bold tracking-[3px] text-accent uppercase">
          {product.category}
        </p>
        <h1 className="mb-2 mt-3 font-serif text-[clamp(32px,4vw,48px)] font-normal">
          {product.name}
        </h1>
        <h2 className="mb-2 text-xl font-semibold text-accent">
          Rs. {currentPrice.toLocaleString("en-PK")}
          {currentPrice < product.price && (
            <span className="ml-3 text-base font-normal text-muted line-through">
              Rs. {product.price.toLocaleString("en-PK")}
            </span>
          )}
        </h2>
        {getSalePercent(product) > 0 && (
          <p className="mb-5 text-xs font-bold uppercase tracking-[1px] text-[#9a5137]">
            {getSalePercent(product)}% off
          </p>
        )}
        <p className="mb-8 text-sm leading-[1.7] text-muted">{product.description}</p>

        <ProductOptions
          sizes={product.sizes}
          colors={product.colors}
          product={{
            id: product.id,
            name: product.name,
            price: currentPrice,
            image: product.image,
          }}
        />
      </div>
    </section>
  );
}