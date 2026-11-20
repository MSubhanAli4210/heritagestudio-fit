import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import HomeCatalog from "@/components/home/HomeCatalog";
import Image from "next/image";
import Link from "next/link";

const steps = [
  { n: "01", icon: "♧", title: "Choose Garment", text: "Select a shirt, hoodie or sweatshirt." },
  { n: "02", icon: "↑", title: "Upload Design", text: "Upload artwork or create your own text." },
  { n: "03", icon: "◎", title: "Preview Design", text: "See how your print looks on the garment." },
  { n: "04", icon: "✓", title: "Place Order", text: "Choose your size and complete your order." },
];

export default function Home() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<div className="min-h-[520px]" aria-label="Loading products" />}>
        <HomeCatalog />
      </Suspense>

      {/* How It Works */}
      <section className="mx-[7%] my-10 grid gap-8 rounded-[18px] bg-card px-9 py-12 lg:grid-cols-[220px_repeat(4,1fr)] lg:items-start lg:gap-6">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-accent">SIMPLE PROCESS</p>
          <h2 className="my-2.5 font-serif text-[32px] font-normal">How It Works?</h2>
          <p className="text-[13px] leading-relaxed text-muted">
            Turn your ideas into wearable art in just a few steps.
          </p>
        </div>

        {steps.map((step) => (
          <div key={step.n} className="px-2 text-center">
            <span className="text-[10px] font-bold tracking-[2px] text-accent">{step.n}</span>
            <div className="my-2.5 text-[32px]" aria-hidden="true">
              {step.icon}
            </div>
            <h3 className="mb-1.5 text-[13px] font-semibold">{step.title}</h3>
            <p className="text-[11px] leading-normal text-muted">{step.text}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-6 bg-foreground px-[7%] py-[50px] text-center text-background md:flex-row md:flex-wrap md:text-left">
        <div>
          <Image
            src="/icons/HS%20Logo%20%20w.png"
            alt="Heritage Studio"
            width={2234}
            height={599}
            className="mb-1 h-auto w-[145px]"
          />
          <p className="font-serif text-[13px] italic text-[#c0b8ac]">Wear Your Own Expression.</p>
        </div>

        <div className="flex gap-6 text-xs">
          <Link href="/shop">Shop</Link>
          <Link href="/customize">Customize</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <span className="text-[11px] text-[#aaa295]">
          © 2026 Heritage Studio. All rights reserved.
        </span>
      </footer>
    </main>
  );
}