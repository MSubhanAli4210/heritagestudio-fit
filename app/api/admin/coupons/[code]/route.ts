import { z } from "zod";
import { getAdminApiError } from "@/lib/authorization";
import { getDatabase } from "@/lib/mongodb";
import type { Coupon } from "@/types/coupon";

const couponUpdateSchema = z.object({
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

type CouponRecord = Coupon;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

  const { code } = await params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid coupon details." }, { status: 400 });
  }

  const parsed = couponUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the coupon details." }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    const result = await database.collection<CouponRecord>("coupons").updateOne(
      { code: code.toUpperCase() },
      { $set: { ...parsed.data, updatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return Response.json({ error: "Coupon not found." }, { status: 404 });
    const coupon = await database.collection<CouponRecord>("coupons").findOne({ code: code.toUpperCase() });
    if (!coupon) return Response.json({ error: "Coupon could not be reloaded." }, { status: 503 });
    return Response.json({
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        active: coupon.active,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      },
    });
  } catch (error) {
    console.error("Could not update coupon:", error);
    return Response.json({ error: "The coupon could not be updated." }, { status: 503 });
  }
}
