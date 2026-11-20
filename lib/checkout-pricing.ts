import "server-only";

import type { OrderRequest } from "@/lib/order-schema";
import { getCoupon, getCouponDiscount } from "@/lib/coupons";
import { getProductPrice } from "@/lib/product-pricing";
import { getProducts } from "@/lib/product-catalog";

export class CheckoutQuoteError extends Error {}

export async function createCheckoutQuote(
  requestedItems: OrderRequest["items"],
  couponCode?: string,
) {
  const products = await getProducts();
  const items = requestedItems.map((requestedItem) => {
    const product = products.find((candidate) => candidate.id === requestedItem.productId);
    if (
      !product ||
      !product.sizes.includes(requestedItem.size) ||
      !product.colors.includes(requestedItem.color)
    ) {
      throw new CheckoutQuoteError("One of the selected products or options is no longer available.");
    }

    if (requestedItem.customDesign && !["Hoodies", "Sweatshirts"].includes(product.category)) {
      throw new CheckoutQuoteError("Custom printing is not available for this product.");
    }

    const printPrice = requestedItem.customDesign
      ? product.category === "Hoodies" ? 500 : 450
      : 0;
    return {
      productId: product.id,
      name: requestedItem.customDesign ? `Custom ${product.name}` : product.name,
      price: getProductPrice(product) + printPrice,
      image: requestedItem.customDesign?.placement === "Back" ? product.backImage : product.image,
      size: requestedItem.size,
      color: requestedItem.color,
      quantity: requestedItem.quantity,
      ...(requestedItem.customDesign ? { customDesign: requestedItem.customDesign } : {}),
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let couponDiscount = 0;
  let appliedCouponCode: string | undefined;

  if (couponCode) {
    const coupon = await getCoupon(couponCode);
    if (!coupon?.active) {
      throw new CheckoutQuoteError("That coupon code is invalid or inactive.");
    }
    couponDiscount = getCouponDiscount(coupon, subtotal);
    appliedCouponCode = coupon.code;
  }

  return {
    items,
    subtotal,
    couponDiscount,
    total: subtotal - couponDiscount,
    couponCode: appliedCouponCode,
  };
}
