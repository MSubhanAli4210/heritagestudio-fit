import { z } from "zod";

export const couponInputSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(32).regex(/^[A-Z0-9-]+$/),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(1).max(10_000_000),
  active: z.boolean(),
}).superRefine((coupon, context) => {
  if (coupon.discountType === "percent" && coupon.discountValue > 100) {
    context.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "Percentage discounts cannot exceed 100%.",
    });
  }
});

export type CouponInput = z.infer<typeof couponInputSchema>;
