"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { getProductPrice, getSalePercent } from "@/lib/product-pricing";

export default function ClothingRail({ products }: { products: Product[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [dragging, setDragging] = useState(false);

  const scroll = (direction: "left" | "right") => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      left: (direction === "left" ? -1 : 1) * el.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  // Mouse drag only; touch uses native scrolling
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = railRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = railRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    setDragging(false);
    drag.current.active = false;
    setTimeout(() => {
      drag.current.moved = false;
    }, 0);
  };

  // If the user dragged, don't follow the product link
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="overflow-hidden bg-sand pb-[85px] pt-[75px]">
      <div className="mb-[45px] flex flex-col items-start justify-between gap-6 px-[7%] sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-accent">HEURISTIC SHOWROOM</p>
          <h2 className="my-3 font-serif text-[clamp(35px,5vw,58px)] font-normal">
            Interactive Studio Rack
          </h2>
          <p className="text-[13px] text-muted">Hover over a piece to see the back.</p>
        </div>

        <div className="flex gap-2.5">
          {(["left", "right"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              aria-label={`Scroll ${dir}`}
              className="size-[42px] rounded-full border border-[#aaa295] text-[19px] transition hover:bg-foreground hover:text-white"
            >
              {dir === "left" ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={`relative w-full select-none overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* --rail-y = vertical centre of the rail bar; the hanger swings from this point */}
        <div className="relative flex w-max items-start gap-[25px] px-[7vw] pb-10 [--rail-y:11px]">
          <div className="absolute inset-x-0 top-[calc(var(--rail-y)-3px)] z-0 h-1.5 rounded-[5px] bg-linear-to-b from-[#77736d] via-[#d0cbc1] to-[#77736d] shadow-[0_3px_5px_#00000020]" />

          {products.map((product, index) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              draggable={false}
              className="group relative z-[1] block w-[175px] shrink-0 text-center [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-accent sm:w-[220px]"
            >
              {/* Hanger + card swing together from the rail */}
              <div
                className="flex w-full origin-[54%_var(--rail-y)] animate-sway flex-col items-center will-change-transform motion-reduce:animate-none"
                style={{ animationDelay: `${index * -0.8}s` }}
              >
                <svg
                  className="relative z-[2] block h-[70px] w-[100px] shrink-0"
                  viewBox="0 0 100 70"
                  aria-hidden="true"
                >
                  <path
                    d="M50 15 C50 2 67 2 67 12 C67 19 57 20 50 26 L5 59 Q50 48 95 59 L50 26"
                    fill="none"
                    stroke="#806c55"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Photo card: front always visible, back fades in on hover/focus */}
                <div className="relative -mt-[34px] h-[250px] w-full overflow-hidden rounded-lg bg-cloth shadow-[0_14px_28px_rgba(41,39,33,0.18)] transition-shadow duration-500 group-hover:shadow-[0_20px_36px_rgba(41,39,33,0.28)] sm:h-[300px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    draggable={false}
                    className="pointer-events-none absolute inset-0 size-full select-none object-cover"
                  />
                  <img
                    src={product.backImage}
                    alt={`${product.name}, back view`}
                    draggable={false}
                    className="pointer-events-none absolute inset-0 size-full select-none object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </div>
              </div>

              <div className="mt-[17px] flex justify-between gap-2 text-left text-[11px]">
                <span>{product.name}</span>
                <span className="whitespace-nowrap">
                  Rs. {getProductPrice(product).toLocaleString("en-PK")}
                  {getSalePercent(product) > 0 && <span className="ml-1 text-[#9a5137]">{getSalePercent(product)}% off</span>}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-[9px] tracking-[3px] text-muted">
        — DRAG TO BROWSE • HOVER TO SEE THE BACK • CLICK FOR DETAILS —
      </p>
    </section>
  );
}