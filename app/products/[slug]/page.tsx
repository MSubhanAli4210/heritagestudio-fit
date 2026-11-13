import { products } from "@/data/products";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = products.find((item) => item.id === slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <header className="navbar">
        <Link href="/" className="brand">
          HEURISTIC<span>STUDIO</span>
        </Link>
        <Link href="/shop">Back to shop ←</Link>
      </header>

      <section className="product-detail">
        <img src={product.image} alt={product.name} />

        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <h2>Rs. {product.price.toLocaleString("en-PK")}</h2>
          <p>{product.description}</p>

          <p>Available sizes</p>
          <div className="detail-options">
            {product.sizes.map((size) => (
              <button key={size}>{size}</button>
            ))}
          </div>

          <p>Available colors</p>
          <div className="detail-options">
            {product.colors.map((color) => (
              <button key={color}>{color}</button>
            ))}
          </div>

          <button className="primary-button">
            Add to bag
          </button>
        </div>
      </section>
    </main>
  );
}