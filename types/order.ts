import type { CartItem } from "./cart";

export type Order = {
  id: string;
  createdAt: string;
  status: "Received" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  coupon?: {
    code: string;
    discountAmount: number;
  };
};