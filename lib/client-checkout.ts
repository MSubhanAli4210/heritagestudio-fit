import type { CartItem } from "@/types/cart";
import type { CheckoutQuote } from "@/types/checkout";

export async function requestCheckoutQuote(items: CartItem[], couponCode?: string) {
  const response = await fetch("/api/checkout/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map(({ productId, size, color, quantity, customDesign }) => ({
        productId,
        size,
        color,
        quantity,
        ...(customDesign ? { customDesign } : {}),
      })),
      ...(couponCode ? { couponCode } : {}),
    }),
  });
  const result = await response.json() as CheckoutQuote & { error?: string };
  if (!response.ok) {
    throw new Error(result.error || "Current pricing could not be loaded.");
  }
  return result;
}

export function updateCartPrices(
  items: CartItem[],
  quote: CheckoutQuote,
  quotedItems: CartItem[] = items,
) {
  const pricesByCartItemId = new Map(
    quotedItems.map((item, index) => [item.id, quote.items[index]]),
  );
  return items.map((item) => {
    const updated = pricesByCartItemId.get(item.id);
    return updated ? { ...item, ...updated, id: item.id } : item;
  });
}
