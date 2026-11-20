"use client";

import { useState } from "react";
import { addCartItem } from "@/lib/cart";

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2.5 text-xs font-semibold tracking-[1px] uppercase">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`min-w-12 rounded-md border px-4 py-2.5 text-[13px] transition ${
                selected
                  ? "border-foreground bg-foreground text-white"
                  : "border-[#aaa295] hover:border-foreground"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductOptions({
  sizes,
  colors,
  product,
}: {
  sizes: string[];
  colors: string[];
  product: { id: string; name: string; price: number; image: string };
}) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const ready = size && color;

  const addToBag = () => {
    if (!ready) return;
    addCartItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size!,
      color: color!,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <OptionGroup label="Available sizes" options={sizes} value={size} onChange={setSize} />
      <OptionGroup label="Available colors" options={colors} value={color} onChange={setColor} />

      <button
        type="button"
        onClick={addToBag}
        disabled={!ready}
        className="inline-flex items-center gap-4 bg-foreground px-6 py-3.5 text-xs font-semibold tracking-[1px] text-white transition hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-foreground"
      >
        {added ? "Added ✓" : ready ? "Add to bag" : "Select size & color"}
      </button>
    </>
  );
}