import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import NavbarClient from "./NavbarClient";

function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between gap-6 border-b border-line/80 bg-background/80 px-[7%] backdrop-blur-md md:h-[78px]">
      <Link href="/" aria-label="Heritage Studio home" className="shrink-0">
        <Image
          src="/icons/HS%20Logo%20b.png"
          alt="Heritage Studio"
          width={2234}
          height={599}
          className="h-auto w-[130px] md:w-[150px]"
        />
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