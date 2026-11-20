 "use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import type { Product } from "@/data/products";
import { addCartItem } from "@/lib/cart";
import { getProductPrice } from "@/lib/product-pricing";

export default function CustomizePage() {
  const [printableProducts, setPrintableProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [placement, setPlacement] = useState<"Front" | "Back">("Front");
  const [designUrl, setDesignUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [fileName, setFileName] = useState("");
  const [scale, setScale] = useState(30);
  const [transparency, setTransparency] = useState(30);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(42);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then(async (response) => {
        const result = await response.json() as { products?: Product[]; error?: string };
        if (!response.ok) throw new Error(result.error || "The product catalog is unavailable.");
        if (!active) return;
        const printable = (result.products ?? []).filter((item) =>
          ["Hoodies", "Sweatshirts"].includes(item.category)
        );
        setPrintableProducts(printable);
        setSelectedId(printable[0]?.id ?? "");
      })
      .catch((loadError: unknown) => {
        if (active) setCatalogError(loadError instanceof Error ? loadError.message : "The product catalog is unavailable.");
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const product = printableProducts.find((item) => item.id === selectedId) ?? printableProducts[0];
  const selectedSize = product?.sizes.includes(size) ? size : product?.sizes[0] ?? "";
  const selectedColor = product?.colors.includes(color) ? color : product?.colors[0] ?? "";
  const garmentImage = product ? placement === "Back" ? product.backImage : product.image : "";
  const printPrice = product?.category === "Hoodies" ? 500 : 450;
  const totalPrice = product ? getProductPrice(product) + printPrice : 0;

  const handleUpload = async (file?: File) => {
    setError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Please upload a PNG, JPG, or WebP file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Your design must be smaller than 4 MB.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const result = await response.json() as {
        imageUrl?: string;
        publicId?: string;
        error?: string;
      };

      if (!response.ok || !result.imageUrl || !result.publicId) {
        throw new Error(result.error || "We could not upload your design. Please try again.");
      }

      setDesignUrl(result.imageUrl);
      setPublicId(result.publicId);
      setFileName(file.name);
      setAdded(false);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "We could not upload your design.");
    } finally {
      setUploading(false);
    }
  };

  const addToBag = () => {
    if (!product) return;
    if (!designUrl) {
      setError("Upload a design before adding this garment to your bag.");
      return;
    }

    addCartItem({
      productId: product.id,
      name: `Custom ${product.name}`,
      price: totalPrice,
      image: garmentImage,
      size: selectedSize,
      color: selectedColor,
      customDesign: {
        imageUrl: designUrl,
        publicId,
        fileName,
        placement,
        scale,
        transparency,
        positionX,
        positionY,
      },
    });
    setAdded(true);
  };

  if (loadingProducts) {
    return (
      <main>
        <Navbar />
        <p className="mx-[7%] py-16 text-sm text-muted">Loading printable products…</p>
      </main>
    );
  }

  if (catalogError || !product) {
    return (
      <main>
        <Navbar />
        <section className="mx-[7%] py-16">
          <p role={catalogError ? "alert" : undefined} className="text-sm text-muted">
            {catalogError || "There are no printable products available right now."}
          </p>
          <Link href="/shop" className="mt-5 inline-block text-sm font-semibold underline">Browse the store</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="px-[7%] py-10 md:py-[60px]">
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-[3px] text-accent">DESIGN STUDIO</p>
          <h1 className="mt-2 font-serif text-[clamp(36px,5vw,56px)] leading-tight">
            Create your custom piece
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div className="relative min-h-[520px] overflow-hidden rounded-2xl bg-cloth">
            <img
              src={garmentImage}
              alt={`${product.name}, ${placement.toLowerCase()} view`}
              className="absolute inset-0 h-full w-full object-contain p-4"
            />
            {designUrl && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                style={{
                  width: `${scale}%`,
                  left: `${positionX}%`,
                  top: `${positionY}%`,
                  height: "34%",
                  mixBlendMode: "multiply",
                  opacity: 1,
                  filter: "saturate(.82) contrast(1.08)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                  maskComposite: "intersect",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 8%, #000 92%, transparent 100%)",
                  WebkitMaskComposite: "source-in",
                }}
              >
                <img
                  src={designUrl}
                  alt="Uploaded design preview"
                  className="h-full w-full object-contain"
                  style={{ opacity: (100 - transparency) / 100 }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(255,255,255,.22) 0, rgba(255,255,255,.22) 1px, transparent 1px, transparent 3px)",
                    mixBlendMode: "overlay",
                  }}
                />
              </div>
            )}
            {!designUrl && (
              <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded border border-dashed border-white/80 bg-black/45 px-4 py-3 text-center text-[10px] font-bold tracking-[2px] text-white backdrop-blur-sm">
                YOUR DESIGN HERE
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 md:p-7">
            <div className="mb-7">
              <p className="mb-3 text-xs font-bold tracking-[1px] uppercase">1. Choose garment</p>
              <div className="grid grid-cols-2 gap-3">
                {printableProducts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={item.id === selectedId}
                    className={`rounded-lg border p-2 text-left transition ${
                      item.id === selectedId ? "border-foreground bg-background" : "border-transparent bg-cloth"
                    }`}
                  >
                    <img src={item.image} alt="" className="h-28 w-full object-contain" />
                    <span className="block px-1 text-[11px] font-semibold">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <p className="mb-3 text-xs font-bold tracking-[1px] uppercase">2. Upload artwork</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleUpload(event.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-[#aaa295] px-4 py-4 text-left text-sm hover:border-foreground disabled:cursor-wait disabled:opacity-60"
              >
                <span className="truncate pr-3">{uploading ? "Uploading design…" : fileName || "Choose your design"}</span>
                <span className="text-xs font-bold tracking-[1px]">{uploading ? "…" : "UPLOAD ↑"}</span>
              </button>
            </div>

            {designUrl && (
              <div className="mb-7 space-y-4">
                <div>
                  <label className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Print size</span><span>{scale}%</span>
                  </label>
                  <input type="range" min="15" max="55" value={scale} onChange={(event) => setScale(Number(event.target.value))} className="w-full accent-[#292721]" />
                </div>
                <div>
                  <label htmlFor="print-transparency" className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Print transparency</span><span>{transparency}%</span>
                  </label>
                  <input
                    id="print-transparency"
                    type="range"
                    min="0"
                    max="100"
                    value={transparency}
                    onChange={(event) => setTransparency(Number(event.target.value))}
                    className="w-full accent-[#292721]"
                  />
                </div>
                <div>
                  <label className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Horizontal position</span><span>{positionX}%</span>
                  </label>
                  <input type="range" min="35" max="65" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} className="w-full accent-[#292721]" />
                </div>
                <div>
                  <label className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Vertical position</span><span>{positionY}%</span>
                  </label>
                  <input type="range" min="25" max="62" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} className="w-full accent-[#292721]" />
                </div>
              </div>
            )}

            <div className="mb-7 grid grid-cols-2 gap-5">
              <div>
                <p className="mb-2 text-xs font-bold tracking-[1px] uppercase">Placement</p>
                <div className="flex gap-2">
                  {(["Front", "Back"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPlacement(option)}
                      className={`flex-1 rounded-md border px-3 py-2.5 text-xs ${placement === option ? "border-foreground bg-foreground text-white" : "border-[#aaa295]"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold tracking-[1px] uppercase">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      className={`size-9 rounded-md border text-xs ${selectedSize === option ? "border-foreground bg-foreground text-white" : "border-[#aaa295]"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-7">
              <p className="mb-2 text-xs font-bold tracking-[1px] uppercase">Color</p>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    className={`rounded-md border px-3 py-2 text-xs ${selectedColor === option ? "border-foreground bg-foreground text-white" : "border-[#aaa295]"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mb-4 text-xs text-red-700" role="alert">{error}</p>}

            <div className="mb-5 flex items-end justify-between border-t border-line pt-5">
              <div>
                <p className="text-[10px] font-bold tracking-[1px] text-muted">GARMENT + PRINT</p>
                <p className="mt-1 text-[11px] text-muted">Printing: Rs. {printPrice.toLocaleString("en-PK")}</p>
              </div>
              <p className="text-xl font-semibold">Rs. {totalPrice.toLocaleString("en-PK")}</p>
            </div>

            {added ? (
              <Link href="/cart" className="flex w-full items-center justify-center bg-accent px-6 py-4 text-xs font-bold tracking-[1px] text-white">
                VIEW BAG ✓
              </Link>
            ) : (
              <button type="button" disabled={uploading} onClick={addToBag} className="w-full bg-foreground px-6 py-4 text-xs font-bold tracking-[1px] text-white transition hover:bg-accent-dark disabled:opacity-50">
                ADD CUSTOM PIECE TO BAG
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}