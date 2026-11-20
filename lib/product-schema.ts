import { z } from "zod";

function isAllowedProductImage(value: string) {
  if (value.startsWith("/images/") && !value.includes("..")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/heuristicstudio/products/");
  } catch {
    return false;
  }
}

export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(60),
  price: z.number().int().min(1).max(10_000_000),
  salePrice: z.number().int().min(1).max(10_000_000).nullable(),
  image: z.string().trim().min(1).max(2048).refine(isAllowedProductImage, "Upload a product image."),
  backImage: z.string().trim().min(1).max(2048).refine(isAllowedProductImage, "Upload a back image."),
  description: z.string().trim().min(1).max(1000),
  colors: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
  sizes: z.array(z.string().trim().min(1).max(20)).min(1).max(20),
  isActive: z.boolean(),
}).superRefine((product, context) => {
  if (product.salePrice !== null && product.salePrice >= product.price) {
    context.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "Sale price must be lower than the regular price.",
    });
  }
});

export type ProductInput = z.infer<typeof productInputSchema>;
