import { products as builtInProducts, type Product } from "@/data/products";
import { getAdminApiError } from "@/lib/authorization";
import { getDatabase } from "@/lib/mongodb";
import { productInputSchema } from "@/lib/product-schema";
import { getProducts } from "@/lib/product-catalog";

type ProductRecord = Product & { createdAt: string; updatedAt: string };

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function makeProductId(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function GET() {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

  try {
    return Response.json({ products: await getProducts({ includeInactive: true }) });
  } catch (error) {
    console.error("Could not load admin products:", error);
    return Response.json({ error: "Products are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const accessError = await getAdminApiError();
  if (accessError) return accessError;

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

  const id = makeProductId(parsed.data.name);
  if (!id) {
    return Response.json({ error: "The product name needs at least one letter or number." }, { status: 400 });
  }
  if (builtInProducts.some((product) => product.id === id)) {
    return Response.json({ error: "A built-in product already uses this name." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const product: ProductRecord = { ...parsed.data, id, createdAt: now, updatedAt: now };

  try {
    await (await getDatabase()).collection<ProductRecord>("products").insertOne(product);
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return Response.json({ error: "A product with this name already exists." }, { status: 409 });
    }
    console.error("Could not create product:", error);
    return Response.json({ error: "The product could not be saved." }, { status: 503 });
  }
}
