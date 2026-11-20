 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/orders")
      .then(async (response) => {
        const result = await response.json() as { orders?: Order[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Orders are temporarily unavailable.");
        if (active) setOrders(result.orders ?? []);
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Orders are temporarily unavailable.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <Navbar />
      <section className="mx-[7%] py-10 md:py-[60px]">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">ORDER HISTORY</p>
        <h1 className="mb-8 mt-2 font-serif text-[clamp(36px,5vw,52px)]">Your orders</h1>

        {loading ? (
          <p className="rounded-xl border border-line p-8 text-sm text-muted">Loading your orders…</p>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-line p-8 text-sm text-red-700">{error}</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card px-6 py-16 text-center">
            <p className="mb-5 font-serif text-2xl">No orders yet</p>
            <Link href="/customize" className="inline-flex bg-foreground px-6 py-3.5 text-xs font-bold tracking-[1px] text-white">
              CREATE YOUR FIRST PIECE
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-line p-5 md:p-7">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                  <div>
                    <p className="text-xs font-bold">Order {order.id}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#dce5d5] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[#4f6445]">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                      <div>
                        <p>{item.quantity} × {item.name}</p>
                        <p className="mt-1 text-[11px] text-muted">
                          Size {item.size}{item.customDesign ? ` · ${item.customDesign.placement} print` : ""}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-semibold">Rs. {(item.price * item.quantity).toLocaleString("en-PK")}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-between border-t border-line pt-5 font-semibold">
                  <span>Total</span>
                  <span>Rs. {order.total.toLocaleString("en-PK")}</span>
                </div>
                {order.coupon && (
                  <p className="mt-2 text-right text-xs text-green-800">
                    Coupon {order.coupon.code} saved Rs. {order.coupon.discountAmount.toLocaleString("en-PK")}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}