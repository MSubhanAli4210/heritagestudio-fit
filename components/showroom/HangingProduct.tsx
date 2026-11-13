"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Product } from "@/data/products";

interface Props {
  product: Product;
}

export default function HangingProduct({ product }: Props) {
  return (
    <Link href={`/products/${product.id}`} className="hanging-product">
      <motion.div
        className="hanger"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg viewBox="0 0 100 70" className="hanger-shape">
          <path
            d="M50 15 C50 2 67 2 67 12 C67 19 57 20 50 26 L5 59 Q50 48 95 59 L50 26"
            fill="none"
            stroke="#806c55"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="garment">
          <img src={product.image} alt={product.name} draggable={false} />
        </div>
      </motion.div>

      <div className="product-caption">
        <span>{product.name}</span>
        <span>Rs. {product.price.toLocaleString("en-PK")}</span>
      </div>
    </Link>
  );
}