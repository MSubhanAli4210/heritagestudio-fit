import { getProducts } from "@/lib/product-catalog";

export async function GET() {
  try {
    return Response.json({ products: await getProducts() });
  } catch (error) {
    console.error("Could not retrieve the product catalog:", error);
    return Response.json({ error: "The product catalog is temporarily unavailable." }, { status: 503 });
  }
}
