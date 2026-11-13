import Navbar from "@/components/layout/Navbar";
import ClothingRail from "@/components/showroom/ClothingRail";
import { products } from "@/data/products";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="hero hero-updated">
        <div className="hero-content">
          <p className="eyebrow">HEURISTIC STUDIO — CUSTOM APPAREL</p>

          <h1>
            Wear Your
            <br />
            <span>Own Expression.</span>
          </h1>

          <p className="hero-description">
            Premium apparel. Custom printing. Endless possibilities. Turn your
            ideas into something you can wear.
          </p>

          <Link href="/customize" className="primary-button">
            Design Your Own <span>↗</span>
          </Link>
        </div>

        <div className="hero-visual">
          <div className="hero-shirt">
            <img
              src={products[0].image}
              alt="Sample custom printed T-shirt"
            />
            <span className="shirt-label">YOUR DESIGN HERE</span>
          </div>

          <div className="hero-note">
            <span>✳</span>
            Upload your design
            <br />& see it live!
          </div>

          <div className="hero-decoration">
            CUSTOM
            <br />
            PRINTING
          </div>
        </div>
      </section>

      {/* Clothing Collection */}
      <ClothingRail />

      {/* How It Works */}
      <section className="how-section">
        <div className="how-intro">
          <p className="eyebrow">SIMPLE PROCESS</p>
          <h2>How It Works?</h2>
          <p>Turn your ideas into wearable art in just a few steps.</p>
        </div>

        <div className="how-step">
          <span>01</span>
          <div className="step-icon">♧</div>
          <h3>Choose Garment</h3>
          <p>Select a shirt, hoodie or sweatshirt.</p>
        </div>

        <div className="how-step">
          <span>02</span>
          <div className="step-icon">↑</div>
          <h3>Upload Design</h3>
          <p>Upload artwork or create your own text.</p>
        </div>

        <div className="how-step">
          <span>03</span>
          <div className="step-icon">◎</div>
          <h3>Preview Design</h3>
          <p>See how your print looks on the garment.</p>
        </div>

        <div className="how-step">
          <span>04</span>
          <div className="step-icon">✓</div>
          <h3>Place Order</h3>
          <p>Choose your size and complete your order.</p>
        </div>
      </section>

      {/* Our Creations */}
      <section className="creations-section">
        <div className="creations-heading">
          <div>
            <p className="eyebrow">MADE BY CREATIVITY</p>
            <h2>Our Creations</h2>
            <p>Real designs. Endless possibilities.</p>
          </div>

          <Link href="/shop">Explore collection ↗</Link>
        </div>

        <div className="creations-grid">
          {products.slice(0, 4).map((product) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="creation-card"
            >
              <img src={product.image} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p>Custom apparel inspiration</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>
          <h2>HEURISTIC STUDIO</h2>
          <p>Wear Your Own Expression.</p>
        </div>

        <div className="footer-links">
          <Link href="/shop">Shop</Link>
          <Link href="/customize">Customize</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <span>© 2026 Heuristic Studio. All rights reserved.</span>
      </footer>
    </main>
  );
}