import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/mongodb";
import { orderRequestSchema } from "@/lib/order-schema";
import { getOrCreateVisitorToken, hashVisitorToken } from "@/lib/visitor-token";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/authorization";
import { CheckoutQuoteError, createCheckoutQuote } from "@/lib/checkout-pricing";
import type { Order } from "@/types/order";

type StoredOrder = Order & { visitorTokenHash: string; userId?: string };

export async function GET() {
  try {
    const database = await getDatabase();
    const session = await getCurrentSession();
    const query = session?.user.emailVerified
      ? { userId: session.user.id }
      : { visitorTokenHash: hashVisitorToken(await getOrCreateVisitorToken()) };

    const orders = await database
      .collection<StoredOrder>("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .project({ visitorTokenHash: 0, userId: 0, _id: 0 })
      .toArray();

    return Response.json({ orders });
  } catch (error) {
    console.error("Could not retrieve orders:", error);
    return Response.json({ error: "Orders are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid order request." }, { status: 400 });
  }

  const parsed = orderRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Please check your delivery information and bag contents." }, { status: 400 });
  }

  for (const requestedItem of parsed.data.items) {
    if (requestedItem.customDesign) {
      const designUrl = new URL(requestedItem.customDesign.imageUrl);
      if (
        !requestedItem.customDesign.publicId.startsWith("heuristicstudio/designs/") ||
        designUrl.protocol !== "https:" ||
        designUrl.hostname !== "res.cloudinary.com" ||
        !designUrl.pathname.includes(`/${requestedItem.customDesign.publicId}`)
      ) {
        return Response.json({ error: "The uploaded design is invalid." }, { status: 400 });
      }
    }
  }

  let quote;
  try {
    quote = await createCheckoutQuote(parsed.data.items, parsed.data.couponCode);
  } catch (error) {
    if (error instanceof CheckoutQuoteError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Could not calculate order pricing:", error);
    return Response.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }

  try {
    const visitorToken = await getOrCreateVisitorToken();
    const session = await getCurrentSession();
    const rateLimit = await consumeRateLimit(visitorToken, "order", 3, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Order limit reached. Please contact the studio if you need help." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const publicOrder: Order = {
      id: `HS-${randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "Received",
      customer: parsed.data.customer,
      items: quote.items.map((item) => ({ ...item, id: randomUUID() })),
      total: quote.total,
      ...(quote.couponCode
        ? { coupon: { code: quote.couponCode, discountAmount: quote.couponDiscount } }
        : {}),
    };

    await (await getDatabase()).collection<StoredOrder>("orders").insertOne({
      ...publicOrder,
      visitorTokenHash: hashVisitorToken(visitorToken),
      ...(session?.user.emailVerified ? { userId: session.user.id } : {}),
    });
    return Response.json({ order: publicOrder }, { status: 201 });
  } catch (error) {
    console.error("Could not save order:", error);
    return Response.json({ error: "We could not place your order. Please try again." }, { status: 503 });
  }
}
