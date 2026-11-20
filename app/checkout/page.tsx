 "use client";

 import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { cartSubtotal, readCart, writeCart } from "@/lib/cart";
import type { CartItem } from "@/types/cart";
 import type { CheckoutQuote } from "@/types/checkout";
 import { requestCheckoutQuote, updateCartPrices } from "@/lib/client-checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [pricingLoading, setPricingLoading] = useState(true);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponFeedback, setCouponFeedback] = useState("");
  const initialItems = useRef(items);

  const loadQuote = useCallback(async (cartItems: CartItem[], couponCode?: string) => {
    const currentQuote = await requestCheckoutQuote(cartItems, couponCode);
    setQuote(currentQuote);
    setItems((current) => updateCartPrices(current, currentQuote, cartItems));
    return currentQuote;
  }, []);

  useEffect(() => {
    let active = true;
    const currentItems = initialItems.current;
    if (currentItems.length === 0) {
      Promise.resolve().then(() => {
        if (active) setPricingLoading(false);
      });
      return () => {
        active = false;
      };
    }

    requestCheckoutQuote(currentItems)
      .then((currentQuote) => {
        if (!active) return;
        setQuote(currentQuote);
        setItems((current) => updateCartPrices(current, currentQuote, currentItems));
      })
      .catch((quoteError: unknown) => {
        if (active) {
          setPricingError(quoteError instanceof Error ? quoteError.message : "Current pricing could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setPricingLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const applyCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCouponFeedback("");
    setPricingError("");
    setPricingLoading(true);
    try {
      const code = couponInput.trim();
      const currentQuote = await loadQuote(items, code || undefined);
      setAppliedCoupon(currentQuote.couponCode ?? "");
      setCouponInput(currentQuote.couponCode ?? "");
      setCouponFeedback(currentQuote.couponCode ? "Coupon applied." : "Coupon removed.");
    } catch (couponError) {
      setCouponFeedback(couponError instanceof Error ? couponError.message : "That coupon could not be applied.");
    } finally {
      setPricingLoading(false);
    }
  };

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      setError("");
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            address: form.get("address"),
          },
          ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
          items: items.map(({ productId, size, color, quantity, customDesign }) => ({
            productId,
            size,
            color,
            quantity,
            ...(customDesign ? { customDesign } : {}),
          })),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "We could not place your order. Please try again.");
      }

      writeCart([]);
      setItems([]);
      router.push("/orders");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = quote?.subtotal ?? cartSubtotal(items);
  const total = quote?.total ?? subtotal;

  return (
    <main>
      <Navbar />
      <section className="mx-[7%] py-10 md:py-[60px]">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">SECURE CHECKOUT</p>
        <h1 className="mb-8 mt-2 font-serif text-[clamp(36px,5vw,52px)]">Delivery details</h1>

        {items.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-10 text-center">
            <p className="mb-5">Your bag is empty.</p>
            <button type="button" onClick={() => router.push("/customize")} className="bg-foreground px-6 py-3 text-xs font-bold text-white">
              CUSTOMIZE A PIECE
            </button>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid gap-4 rounded-xl border border-line p-5 md:grid-cols-2 md:p-7">
              <label className="text-xs font-semibold md:col-span-2">
                Full name
                <input name="name" required autoComplete="name" className="mt-2 w-full rounded-md border border-[#aaa295] bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
              </label>
              <label className="text-xs font-semibold">
                Email
                <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-md border border-[#aaa295] bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
              </label>
              <label className="text-xs font-semibold">
                Phone
                <input name="phone" type="tel" required autoComplete="tel" className="mt-2 w-full rounded-md border border-[#aaa295] bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
              </label>
              <label className="text-xs font-semibold md:col-span-2">
                Delivery address
                <textarea name="address" required rows={4} autoComplete="street-address" className="mt-2 w-full resize-none rounded-md border border-[#aaa295] bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
              </label>
            </div>

            <aside className="h-fit rounded-xl bg-card p-6">
              <h2 className="mb-5 font-serif text-xl">Your order</h2>
              <div className="mb-5 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted">{item.quantity} × {item.name}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={applyCoupon} className="mb-5 border-t border-line pt-4">
                <label htmlFor="coupon-code" className="text-xs font-semibold">Coupon code</label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="coupon-code"
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                    maxLength={32}
                    className="min-w-0 flex-1 rounded-md border border-line bg-white/70 px-3 py-2.5 text-xs outline-none focus:border-accent"
                    placeholder="Enter code"
                  />
                  <button type="submit" disabled={pricingLoading} className="rounded-md border border-foreground px-3 text-[10px] font-bold disabled:opacity-50">
                    APPLY
                  </button>
                </div>
                {couponFeedback && <p role="status" className={`mt-2 text-[11px] ${couponFeedback.includes("applied") || couponFeedback.includes("removed") ? "text-green-800" : "text-red-700"}`}>{couponFeedback}</p>}
              </form>
              {pricingError && <p role="alert" className="mb-4 text-xs text-red-700">{pricingError}</p>}
              <div className="mb-3 flex justify-between border-t border-line pt-4 text-sm">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString("en-PK")}</span>
              </div>
              {quote?.couponDiscount ? (
                <div className="mb-3 flex justify-between text-sm text-green-800">
                  <span>{quote.couponCode} discount</span>
                  <span>− Rs. {quote.couponDiscount.toLocaleString("en-PK")}</span>
                </div>
              ) : null}
              <div className="mb-5 flex justify-between border-t border-line pt-4 font-semibold">
                <span>Payable total</span>
                <span>Rs. {total.toLocaleString("en-PK")}</span>
              </div>
              {error && <p role="alert" className="mb-4 text-xs text-red-700">{error}</p>}
              <button type="submit" disabled={submitting || pricingLoading || Boolean(pricingError) || !quote} className="w-full bg-foreground px-5 py-4 text-xs font-bold tracking-[1px] text-white disabled:opacity-60">
                {submitting ? "PLACING ORDER…" : pricingLoading ? "UPDATING PRICES…" : "PLACE ORDER"}
              </button>
            </aside>
          </form>
        )}
      </section>
    </main>
  );
}