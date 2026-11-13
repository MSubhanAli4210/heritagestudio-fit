"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { products } from "@/data/products";

export default function ClothingRail() {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (railRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      railRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="rack-section">
      <div className="rack-header">
        <div>
          <p className="eyebrow">HEURISTIC SHOWROOM</p>
          <h2>Interactive Studio Rack</h2>
          <p>Hover over any garment to pull it forward and inspect the front design.</p>
        </div>
        <div className="rail-controls">
          <button onClick={() => scroll("left")} aria-label="Scroll left">←</button>
          <button onClick={() => scroll("right")} aria-label="Scroll right">→</button>
        </div>
      </div>

      {/* Freestanding Gold Rack Structure */}
      <div className="rack-frame-wrapper">
        {/* Metallic Gold Arch Frame */}
        <div className="gold-rack-frame">
          <div className="rack-top-bar" />
          <div className="rack-left-leg" />
          <div className="rack-right-leg" />
        </div>

        {/* Scrollable Track inside the Frame */}
        <div className="clothing-rail" ref={railRef}>
          <div className="products-track">
            {products.map((product) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className="hanging-product"
                tabIndex={0}
              >
                {/* Hanger Hook attached directly to gold top bar */}
                <div className="hanger-hook">
                  <svg viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M40 18 C40 6 52 4 52 14 C52 20 40 18 40 28"
                      stroke="#c89d36"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 28 L10 46 C6 48 8 50 12 50 L68 50 C72 50 74 48 70 46 Z"
                      fill="#d4af37"
                      stroke="#9e7b21"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                {/* Garment (Side profile by default, Front view on Hover) */}
                <div className="garment">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>

                {/* Product Info */}
                <div className="product-caption">
                  <span className="product-title">{product.name}</span>
                  <span className="product-price">
                    Rs. {product.price?.toLocaleString() || "4,499"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p className="drag-hint">— HOVER TO ROTATE • CLICK FOR DETAILS —</p>
    </section>
  );
}