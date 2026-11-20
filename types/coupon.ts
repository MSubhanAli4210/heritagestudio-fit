export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
