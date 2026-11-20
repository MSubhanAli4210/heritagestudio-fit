import { getAdminApiError } from "@/lib/authorization";
import { couponInputSchema } from "@/lib/coupon-schema";
import { getDatabase } from "@/lib/mongodb";
import type { Coupon } from "@/types/coupon";

type CouponRecord = Coupon;

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function GET() {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

  try {
    const coupons = await (await getDatabase())
      .collection<CouponRecord>("coupons")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return Response.json({
      coupons: coupons.map((coupon) => ({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        active: coupon.active,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Could not load admin coupons:", error);
    return Response.json({ error: "Coupons are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid coupon details." }, { status: 400 });
  }

  const parsed = couponInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the coupon details." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const coupon: CouponRecord = { ...parsed.data, createdAt: now, updatedAt: now };

  try {
    await (await getDatabase()).collection<CouponRecord>("coupons").insertOne(coupon);
    return Response.json({ coupon }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "That coupon code already exists." }, { status: 409 });
    }
    console.error("Could not create coupon:", error);
    return Response.json({ error: "The coupon could not be saved." }, { status: 503 });
  }
}
