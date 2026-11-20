import "server-only";

import { getDatabase } from "@/lib/mongodb";
import type { Coupon } from "@/types/coupon";

type StoredCoupon = Coupon & { _id?: unknown };

export async function getCoupon(code: string) {
  const database = await getDatabase();
  const normalizedCode = code.trim().toUpperCase();
  return database.collection<StoredCoupon>("coupons").findOne({ code: normalizedCode });
}

export function getCouponDiscount(coupon: Coupon, subtotal: number) {
  if (!coupon.active || subtotal <= 0) return 0;
  const rawDiscount = coupon.discountType === "percent"
    ? Math.round(subtotal * coupon.discountValue / 100)
    : coupon.discountValue;
  return Math.min(subtotal, rawDiscount);
}
