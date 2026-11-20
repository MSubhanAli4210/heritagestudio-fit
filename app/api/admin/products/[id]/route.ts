import { getAdminApiError } from "@/lib/authorization";
import { getDatabase } from "@/lib/mongodb";
import { getProductById } from "@/lib/product-catalog";
import { productInputSchema } from "@/lib/product-schema";
import type { Product } from "@/data/products";

type ProductRecord = Product & { createdAt: string; updatedAt: string };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

  const { id } = await params;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid product details." }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the product details." }, { status: 400 });
  }

  try {
    const existing = await getProductById(id, { includeInactive: true });
    if (!existing) return Response.json({ error: "Product not found." }, { status: 404 });

    const now = new Date().toISOString();
    const product: Product = {
      ...existing,
      ...parsed.data,
      id,
    };
    const updatedProduct = { ...product, updatedAt: now };
    await (await getDatabase()).collection<ProductRecord>("products").updateOne(
      { id },
      {
        $set: updatedProduct,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    return Response.json({ product: updatedProduct });
  } catch (error) {
    console.error("Could not update product:", error);
    return Response.json({ error: "The product could not be updated." }, { status: 503 });
  }
}
