import type { CartItem } from "@/types/cart";

export const CART_KEY = "heuristicstudio-cart";
export const ORDERS_KEY = "heuristicstudio-orders";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(CART_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value) as Array<CartItem & {
      customDesign?: CartItem["customDesign"] & {
        dataUrl?: string;
        publicId?: string;
        transparency?: number;
      };
    }>;
    return parsed.map((item) => {
      const design = item.customDesign;
      if (!design) return item;

      return {
        ...item,
        customDesign: {
          ...design,
          imageUrl: design.imageUrl || design.dataUrl || "",
          publicId: design.publicId ?? "",
          transparency: design.transparency ?? 30,
        },
      };
    });
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function cartQuantity(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function addCartItem(item: Omit<CartItem, "id" | "quantity">) {
  const items = readCart();
  const existing = items.find((entry) =>
    entry.productId === item.productId &&
    entry.size === item.size &&
    entry.color === item.color &&
    entry.customDesign?.imageUrl === item.customDesign?.imageUrl &&
    entry.customDesign?.placement === item.customDesign?.placement &&
    entry.customDesign?.transparency === item.customDesign?.transparency
  );

  if (existing) {
    writeCart(items.map((entry) => entry.id === existing.id
      ? { ...entry, quantity: entry.quantity + 1 }
      : entry));
  } else {
    writeCart([
      ...items,
      { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, quantity: 1 },
    ]);
  }
}

export function setCartItemQuantity(id: string, quantity: number) {
  const items = readCart();
  writeCart(quantity > 0
    ? items.map((item) => item.id === id ? { ...item, quantity } : item)
    : items.filter((item) => item.id !== id));
}

