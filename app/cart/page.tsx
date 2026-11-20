 "use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { cartSubtotal, readCart, setCartItemQuantity, writeCart } from "@/lib/cart";
import type { CartItem } from "@/types/cart";
import { requestCheckoutQuote, updateCartPrices } from "@/lib/client-checkout";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [pricingError, setPricingError] = useState("");

  const refreshPrices = useCallback((cartItems: CartItem[]) => {
    if (cartItems.length === 0) return;
    return requestCheckoutQuote(cartItems)
      .then((quote) => {
        setItems((current) => updateCartPrices(current, quote, cartItems));
        setPricingError("");
      })
      .catch((error: unknown) => {
      setPricingError(error instanceof Error ? error.message : "Current pricing could not be loaded.");
      });
  }, []);

  useEffect(() => {
    void refreshPrices(readCart());
  }, [refreshPrices]);

  const updateQuantity = (id: string, quantity: number) => {
    setCartItemQuantity(id, quantity);
    setItems(readCart());
  };

  const removeItem = (id: string) => {
    const next = readCart().filter((item) => item.id !== id);
    writeCart(next);
    setItems(next);
    void refreshPrices(next);
  };

  const subtotal = cartSubtotal(items);

  return (
    <main>
      <Navbar />
      <section className="mx-[7%] py-10 md:py-[60px]">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">YOUR SELECTION</p>
        <h1 className="mb-8 mt-2 font-serif text-[clamp(36px,5vw,52px)]">Shopping bag</h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card px-6 py-16 text-center">
            <p className="mb-5 font-serif text-2xl">Your bag is empty</p>
            <Link href="/customize" className="inline-flex bg-foreground px-6 py-3.5 text-xs font-bold tracking-[1px] text-white">
              START CUSTOMIZING
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="divide-y divide-line border-y border-line">
              {items.map((item) => (
                <article key={item.id} className="grid grid-cols-[110px_1fr] gap-4 py-5 md:grid-cols-[150px_1fr] md:gap-6">
                  <div className="relative overflow-hidden rounded-lg bg-cloth">
                    <img src={item.image} alt={item.name} className="h-32 w-full object-contain p-2 md:h-40" />
                    {item.customDesign?.imageUrl && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                        style={{
                          width: `${item.customDesign.scale}%`,
                          left: `${item.customDesign.positionX}%`,
                          top: `${item.customDesign.positionY}%`,
                          height: "34%",
                          mixBlendMode: "multiply",
                          opacity: 1,
                          filter: "saturate(.82) contrast(1.08)",
                          maskImage:
                            "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                          maskComposite: "intersect",
                          WebkitMaskImage:
                            "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                          WebkitMaskComposite: "source-in",
                        }}
                      >
                        <img
                          src={item.customDesign.imageUrl}
                          alt=""
                          className="h-full w-full object-contain"
                          style={{ opacity: (100 - item.customDesign.transparency) / 100 }}
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(0deg, rgba(255,255,255,.22) 0, rgba(255,255,255,.22) 1px, transparent 1px, transparent 3px)",
                            mixBlendMode: "overlay",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h2 className="font-serif text-lg">{item.name}</h2>
                      <p className="mt-1 text-[11px] text-muted">
                        Size {item.size} · {item.color}
                        {item.customDesign && ` · ${item.customDesign.placement} print`}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-[#aaa295]">
                        <button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="size-9">−</button>
                        <span className="min-w-8 text-center text-xs">{item.quantity}</span>
                        <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="size-9">+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</span>
                        <button type="button" onClick={() => removeItem(item.id)} className="text-[11px] underline text-muted">Remove</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-xl bg-card p-6">
              <h2 className="mb-5 font-serif text-xl">Order summary</h2>
              {pricingError && <p role="alert" className="mb-4 text-xs text-red-700">{pricingError}</p>}
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>Rs. {subtotal.toLocaleString("en-PK")}</span>
              </div>
              <div className="mb-5 flex justify-between text-sm">
                <span className="text-muted">Delivery</span>
                <span>Calculated at checkout</span>
              </div>
              <Link href="/checkout" className="block w-full bg-foreground px-5 py-4 text-center text-xs font-bold tracking-[1px] text-white">
                CONTINUE TO CHECKOUT
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}