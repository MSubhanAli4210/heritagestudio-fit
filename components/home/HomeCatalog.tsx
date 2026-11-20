import Link from "next/link";
import { connection } from "next/server";
import ClothingRail from "@/components/showroom/ClothingRail";
import { getProducts } from "@/lib/product-catalog";
import { getProductPrice, getSalePercent } from "@/lib/product-pricing";

export default async function HomeCatalog() {
  await connection();
  const products = await getProducts();
  const heroProduct = products[0];
  const creations = products.filter((product) => product.category === "Our Creations");

  return (
    <>
      <section className="grid min-h-[520px] grid-cols-1 items-center gap-10 overflow-hidden px-[7%] pb-[60px] pt-10 lg:grid-cols-2 lg:pt-[60px]">
        <div className="relative z-[2] max-w-[600px]">
          <p className="text-[10px] font-bold tracking-[3px] text-accent">
            HERITAGE STUDIO — CUSTOM APPAREL
          </p>
          <h1 className="my-5 font-serif text-[clamp(48px,6.5vw,84px)] font-normal leading-[1.05] tracking-[-0.03em]">
            Wear Your
            <br />
            <span className="italic text-[#8b785f]">Own Expression.</span>
          </h1>
          <p className="mb-8 max-w-[420px] text-sm leading-[1.8] text-muted">
            Premium apparel. Custom printing. Endless possibilities. Turn your
            ideas into something you can wear.
          </p>
          <Link
            href="/customize"
            className="inline-flex items-center gap-4 bg-foreground px-6 py-3.5 text-xs font-semibold tracking-[1px] text-white transition hover:-translate-y-0.5 hover:bg-accent-dark"
          >
            Design Your Own <span>↗</span>
          </Link>
        </div>

        <div className="relative flex items-center justify-center px-5 py-[30px]">
          <div className="relative w-full max-w-[380px] overflow-hidden rounded-xl bg-cloth shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            {heroProduct && (
              <img
                src={heroProduct.image}
                alt="Sample custom printed hoodie"
                className="block h-[380px] w-full object-contain p-3"
              />
            )}
            <span className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded border border-dashed border-white/70 bg-black/45 px-4 py-2.5 text-[10px] font-bold tracking-[2px] text-white backdrop-blur-sm">
              YOUR DESIGN HERE
            </span>
          </div>
          <div className="absolute right-[5%] top-[5%] -rotate-6 rounded-lg border border-line bg-background px-3.5 py-2.5 font-serif text-sm italic leading-snug">
            <span className="mb-0.5 block text-lg">✳</span>
            Upload your design
            <br />&amp; see it live!
          </div>
          <div className="absolute bottom-[8%] left-[5%] -rotate-10 font-serif text-base italic text-accent">
            CUSTOM
            <br />
            PRINTING
          </div>
        </div>
      </section>

      <ClothingRail products={products} />

      <section className="px-[7%] py-[75px]">
        <div className="mb-[30px] flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[3px] text-accent">MADE BY CREATIVITY</p>
            <h2 className="my-2.5 font-serif text-[32px] font-normal">Our Creations</h2>
            <p className="text-[13px] leading-relaxed text-muted">
              Real designs. Endless possibilities.
            </p>
          </div>
          <Link href="/shop" className="whitespace-nowrap border-b border-current pb-1 text-xs">
            Explore collection ↗
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {creations.map((product) => {
            const price = getProductPrice(product);
            return (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="group overflow-hidden rounded-lg bg-card"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="block h-72 w-full bg-cloth object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="mb-1 font-serif text-base font-normal">{product.name}</h3>
                  <p className="text-[11px] text-muted">Custom printed</p>
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
      </section>
    </>
  );
}
