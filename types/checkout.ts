import type { CartItem } from "@/types/cart";

export type CheckoutQuote = {
  items: Array<Omit<CartItem, "id">>;
  subtotal: number;
  couponDiscount: number;
  total: number;
  couponCode?: string;
};
