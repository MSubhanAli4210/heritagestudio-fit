import { Suspense } from "react";
import Link from "next/link";
import NavbarClient from "./NavbarClient";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between gap-6 border-b border-line/80 bg-background/80 px-[7%] backdrop-blur-md md:h-[78px]">
      <Link href="/" className="whitespace-nowrap text-[19px] font-extrabold tracking-[2px]">
        HEURISTIC<span className="font-normal text-accent">STUDIO</span>
      </Link>
    </header>
  );
}

export default function Navbar({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarClient cartCount={cartCount} />
    </Suspense>
  );
}