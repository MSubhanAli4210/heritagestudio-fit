"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Product } from "@/data/products";
import type { Coupon } from "@/types/coupon";

type ProductDraft = {
  name: string;
  category: string;
  price: string;
  salePrice: string;
  image: string;
  backImage: string;
  description: string;
  colors: string;
  sizes: string;
  isActive: boolean;
};

const emptyProduct: ProductDraft = {
  name: "",
  category: "Hoodies",
  price: "",
  salePrice: "",
  image: "",
  backImage: "",
  description: "",
  colors: "Black",
  sizes: "S, M, L, XL",
  isActive: true,
};

function productDraft(product: Product): ProductDraft {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    salePrice: product.salePrice ? String(product.salePrice) : "",
    image: product.image,
    backImage: product.backImage,
    description: product.description,
    colors: product.colors.join(", "),
    sizes: product.sizes.join(", "),
    isActive: product.isActive !== false,
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}

function splitOptions(value: string) {
  return [...new Set(value.split(",").map((option) => option.trim()).filter(Boolean))];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"front" | "back" | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"products" | "coupons">("products");

  const refresh = useCallback(async () => {
    const [productResult, couponResult] = await Promise.all([
      requestJson<{ products: Product[] }>("/api/admin/products"),
      requestJson<{ coupons: Coupon[] }>("/api/admin/coupons"),
    ]);
    setProducts(productResult.products);
    setCoupons(couponResult.coupons);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      requestJson<{ products: Product[] }>("/api/admin/products"),
      requestJson<{ coupons: Coupon[] }>("/api/admin/coupons"),
    ])
      .then(([productResult, couponResult]) => {
        if (!active) return;
        setProducts(productResult.products);
        setCoupons(couponResult.coupons);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Admin data could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateDraft = <K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const uploadProductImage = async (file: File | undefined, target: "front" | "back") => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 6 * 1024 * 1024) {
      setError("Choose a PNG, JPG, or WebP image smaller than 6 MB.");
      return;
    }

    setError("");
    setNotice("");
    setUploadingImage(target);
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await requestJson<{ imageUrl: string }>("/api/admin/product-images", {
        method: "POST",
        body,
      });
      updateDraft(target === "front" ? "image" : "backImage", result.imageUrl);
      setNotice(`${target === "front" ? "Front" : "Back"} image uploaded.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.");
    } finally {
      setUploadingImage(null);
    }
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingProduct(true);

    const payload = {
      ...draft,
      price: Number(draft.price),
      salePrice: draft.salePrice.trim() ? Number(draft.salePrice) : null,
      colors: splitOptions(draft.colors),
      sizes: splitOptions(draft.sizes),
    };

    try {
      await requestJson(
        editingId ? `/api/admin/products/${encodeURIComponent(editingId)}` : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await refresh();
      setDraft(emptyProduct);
      setEditingId(null);
      setNotice(editingId ? "Product updated." : "Product added to the catalog.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The product could not be saved.");
    } finally {
      setSavingProduct(false);
    }
  };

  const createCoupon = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingCoupon(true);
    try {
      await requestJson("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          discountValue: Number(couponValue),
          active: true,
        }),
      });
      await refresh();
      setCouponCode("");
      setCouponValue("");
      setNotice("Coupon created.");
    } catch (couponError) {
      setError(couponError instanceof Error ? couponError.message : "The coupon could not be saved.");
    } finally {
      setSavingCoupon(false);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    setError("");
    setNotice("");
    try {
      await requestJson(`/api/admin/coupons/${encodeURIComponent(coupon.code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          active: !coupon.active,
        }),
      });
      await refresh();
      setNotice(`Coupon ${coupon.code} ${coupon.active ? "deactivated" : "activated"}.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "The coupon could not be updated.");
    }
  };

  const formInputClass = "mt-2 w-full rounded-lg border border-line bg-white/70 px-3.5 py-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-line">
        {(["products", "coupons"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-[1px] ${
              tab === value ? "border-accent text-foreground" : "border-transparent text-muted"
            }`}
          >
            {value === "products" ? "Products & sales" : "Coupon codes"}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</p>}
      {loading ? (
        <p className="rounded-xl border border-line p-8 text-sm text-muted">Loading store data…</p>
      ) : tab === "products" ? (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,.7fr)]">
          <section>
            <h2 className="mb-4 font-serif text-2xl">Product catalog</h2>
            <div className="space-y-3">
              {products.map((product) => (
                <article key={product.id} className="grid gap-4 rounded-xl border border-line bg-white/55 p-4 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
                  <img src={product.image} alt="" className="h-24 w-full rounded-lg bg-cloth object-contain p-1 sm:w-[88px]" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.isActive === false && <span className="rounded-full bg-[#ece9e2] px-2.5 py-1 text-[10px] font-bold uppercase text-muted">Hidden</span>}
                      {product.salePrice && <span className="rounded-full bg-[#f6e8df] px-2.5 py-1 text-[10px] font-bold uppercase text-[#9a5137]">On sale</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted">{product.category} · {product.colors.join(", ")} · sizes {product.sizes.join(", ")}</p>
                    <p className="mt-2 text-sm font-semibold">
                      Rs. {product.salePrice ? product.salePrice.toLocaleString("en-PK") : product.price.toLocaleString("en-PK")}
                      {product.salePrice && <span className="ml-2 text-xs font-normal text-muted line-through">Rs. {product.price.toLocaleString("en-PK")}</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(product.id);
                      setDraft(productDraft(product));
                      setError("");
                      setNotice("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-foreground px-4 py-2.5 text-xs font-bold"
                  >
                    EDIT
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="h-fit rounded-2xl border border-line bg-card p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl">{editingId ? "Edit product" : "Add a product"}</h2>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setDraft(emptyProduct); }} className="text-xs underline text-muted">
                  Cancel edit
                </button>
              )}
            </div>
            <form onSubmit={saveProduct} className="space-y-4">
              <label className="block text-xs font-semibold">
                Product name
                <input required maxLength={120} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} className={formInputClass} />
              </label>
              <label className="block text-xs font-semibold">
                Category
                <input required maxLength={60} value={draft.category} onChange={(event) => updateDraft("category", event.target.value)} className={formInputClass} placeholder="Hoodies" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold">
                  Regular price (Rs.)
                  <input required type="number" min="1" step="1" value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} className={formInputClass} />
                </label>
                <label className="block text-xs font-semibold">
                  Sale price (optional)
                  <input type="number" min="1" step="1" value={draft.salePrice} onChange={(event) => updateDraft("salePrice", event.target.value)} className={formInputClass} />
                </label>
              </div>
              <label className="block text-xs font-semibold">
                Description
                <textarea required maxLength={1000} rows={3} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} className={formInputClass} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold">
                  Colors (comma separated)
                  <input required value={draft.colors} onChange={(event) => updateDraft("colors", event.target.value)} className={formInputClass} />
                </label>
                <label className="block text-xs font-semibold">
                  Sizes (comma separated)
                  <input required value={draft.sizes} onChange={(event) => updateDraft("sizes", event.target.value)} className={formInputClass} />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["front", "back"] as const).map((target) => {
                  const image = target === "front" ? draft.image : draft.backImage;
                  return (
                    <label key={target} className="block text-xs font-semibold">
                      {target === "front" ? "Front image" : "Back image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => uploadProductImage(event.target.files?.[0], target)}
                        className="mt-2 block w-full text-[11px] text-muted file:mr-2 file:rounded-md file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white"
                      />
                      {uploadingImage === target && <span className="mt-2 block text-[11px] text-muted">Uploading…</span>}
                      {image && <span className="mt-2 block truncate text-[10px] text-green-800">Image ready</span>}
                    </label>
                  );
                })}
              </div>
              <label className="flex items-center gap-3 text-xs font-semibold">
                <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft("isActive", event.target.checked)} className="size-4 accent-[#292721]" />
                Product is visible in the store
              </label>
              <button type="submit" disabled={savingProduct || uploadingImage !== null} className="w-full rounded-lg bg-foreground px-5 py-3.5 text-xs font-bold tracking-[1px] text-white disabled:opacity-60">
                {savingProduct ? "SAVING…" : editingId ? "SAVE PRODUCT" : "ADD PRODUCT"}
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.7fr)]">
          <section>
            <h2 className="mb-4 font-serif text-2xl">Coupon codes</h2>
            {coupons.length === 0 ? (
              <p className="rounded-xl border border-line bg-white/55 p-6 text-sm text-muted">No coupon codes yet.</p>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <article key={coupon.code} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-white/55 p-4">
                    <div>
                      <p className="font-bold tracking-[1px]">{coupon.code}</p>
                      <p className="mt-1 text-xs text-muted">
                        {coupon.discountType === "percent" ? `${coupon.discountValue}% off` : `Rs. ${coupon.discountValue.toLocaleString("en-PK")} off`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCoupon(coupon)}
                      className={`rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-[1px] ${coupon.active ? "bg-[#dce5d5] text-[#4f6445]" : "bg-[#ece9e2] text-muted"}`}
                    >
                      {coupon.active ? "Active · turn off" : "Inactive · turn on"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="h-fit rounded-2xl border border-line bg-card p-5 md:p-6">
            <h2 className="mb-5 font-serif text-2xl">Create coupon</h2>
            <form onSubmit={createCoupon} className="space-y-4">
              <label className="block text-xs font-semibold">
                Code
                <input required minLength={3} maxLength={32} pattern="[A-Za-z0-9-]+" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} className={formInputClass} placeholder="WELCOME10" />
              </label>
              <label className="block text-xs font-semibold">
                Discount type
                <select value={couponType} onChange={(event) => setCouponType(event.target.value as "percent" | "fixed")} className={formInputClass}>
                  <option value="percent">Percentage off</option>
                  <option value="fixed">Fixed amount off (Rs.)</option>
                </select>
              </label>
              <label className="block text-xs font-semibold">
                Discount value
                <input required type="number" min="1" max={couponType === "percent" ? 100 : 10000000} step="1" value={couponValue} onChange={(event) => setCouponValue(event.target.value)} className={formInputClass} />
              </label>
              <button type="submit" disabled={savingCoupon} className="w-full rounded-lg bg-foreground px-5 py-3.5 text-xs font-bold tracking-[1px] text-white disabled:opacity-60">
                {savingCoupon ? "SAVING…" : "CREATE COUPON"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
