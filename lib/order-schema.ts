import { z } from "zod";

export const customDesignSchema = z.object({
  imageUrl: z.string().url().max(2048),
  publicId: z.string().min(1).max(255),
  fileName: z.string().min(1).max(120),
  placement: z.enum(["Front", "Back"]),
  scale: z.number().int().min(15).max(55),
  positionX: z.number().int().min(35).max(65),
  positionY: z.number().int().min(25).max(62),
});

export const orderItemRequestSchema = z.object({
  productId: z.string().min(1).max(100),
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(40),
  quantity: z.number().int().min(1).max(20),
  customDesign: customDesignSchema.optional(),
});

const couponCodeSchema = z.string().trim().toUpperCase().min(3).max(32).optional();

export const orderQuoteRequestSchema = z.object({
  items: z.array(orderItemRequestSchema).min(1).max(30),
  couponCode: couponCodeSchema,
});

export const orderRequestSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(5).max(40),
    address: z.string().trim().min(5).max(500),
  }),
  items: z.array(orderItemRequestSchema).min(1).max(30),
  couponCode: couponCodeSchema,
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
