import { CheckoutQuoteError, createCheckoutQuote } from "@/lib/checkout-pricing";
import { orderQuoteRequestSchema } from "@/lib/order-schema";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid pricing request." }, { status: 400 });
  }

  const parsed = orderQuoteRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Please check your bag contents and coupon code." }, { status: 400 });
  }

  try {
    return Response.json(await createCheckoutQuote(parsed.data.items, parsed.data.couponCode));
  } catch (error) {
    if (error instanceof CheckoutQuoteError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Could not calculate checkout pricing:", error);
    return Response.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }
}
