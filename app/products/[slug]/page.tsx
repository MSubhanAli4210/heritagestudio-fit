import { products } from "@/data/products";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProductOptions from "@/components/products/ProductOptions";
import ProductGallery from "@/components/products/ProductGallery";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((item) => item.id === slug);

  if (!product) notFound();

  const views = [
    { label: "Front", src: product.image },
    { label: "Back", src: product.backImage },
  ];

  return (
    <main>
      <Navbar />

      <section className="grid gap-8 px-[7%] py-[60px] lg:grid-cols-2 lg:items-start lg:gap-12">
        <ProductGallery name={product.name} views={views} />

        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-accent uppercase">
            {product.category}
          </p>
          <h1 className="mb-2 mt-3 font-serif text-[clamp(32px,4vw,48px)] font-normal">
            {product.name}
          </h1>
          <h2 className="mb-5 text-xl font-semibold text-accent">
            Rs. {product.price.toLocaleString("en-PK")}
          </h2>
          <p className="mb-8 text-sm leading-[1.7] text-muted">{product.description}</p>

          <ProductOptions sizes={product.sizes} colors={product.colors} />
        </div>
      </section>
    </main>
  );
}