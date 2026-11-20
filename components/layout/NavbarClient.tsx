"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="size-[18px] shrink-0 text-accent md:text-current"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ShirtIcon = () => (
  <Icon>
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  </Icon>
);
const PaletteIcon = () => (
  <Icon>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </Icon>
);
const InfoIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Icon>
);
const MailIcon = () => (
  <Icon>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
const BagIcon = () => (
  <svg
    className="size-[18px] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const links = [
  { href: "/shop", label: "Shop", icon: <ShirtIcon /> },
  { href: "/customize", label: "Customize", icon: <PaletteIcon /> },
  { href: "/about", label: "About", icon: <InfoIcon /> },
  { href: "/contact", label: "Contact", icon: <MailIcon /> },
];

const linkClass = [
  "relative inline-flex items-center gap-2 text-[15px] font-medium tracking-[0.3px]",
  "border-b border-line px-1 py-4 transition-colors last:border-b-0 hover:text-accent",
  "md:rounded-full md:border-0 md:px-3.5 md:py-2.5 md:text-[13px]",
  // animated underline (desktop only)
  "after:absolute after:inset-x-3.5 after:bottom-1.5 after:hidden after:h-[1.5px] after:origin-left",
  "after:scale-x-0 after:bg-accent after:transition-transform after:duration-300",
  "md:after:block hover:after:scale-x-100",
  // current page
  "aria-[current=page]:text-accent aria-[current=page]:after:scale-x-100",
].join(" ");

export default function NavbarClient({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState(cartCount);
  const pathname = usePathname();

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem("heuristicstudio-cart") ?? "[]") as Array<{ quantity: number }>;
        setCount(stored.reduce((total, item) => total + item.quantity, 0));
      } catch {
        setCount(0);
      }
    };

    syncCartCount();
    window.addEventListener("cart-updated", syncCartCount);
    window.addEventListener("storage", syncCartCount);
    return () => {
      window.removeEventListener("cart-updated", syncCartCount);
      window.removeEventListener("storage", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between gap-6 border-b border-line/80 px-[7%] backdrop-blur-md backdrop-saturate-150 transition-all duration-300 ${
        scrolled
          ? "h-[60px] bg-background/95 shadow-[0_6px_24px_rgba(41,39,33,0.08)] md:h-16"
          : "h-[68px] bg-background/80 md:h-[78px]"
      }`}
    >
      <Link href="/" aria-label="Heritage Studio home" className="shrink-0">
        <Image
          src="/icons/HS%20Logo%20b.png"
          alt="Heritage Studio"
          width={2234}
          height={599}
          className="h-auto w-[130px] md:w-[150px]"
        />
      </Link>

      <nav
        id="primary-nav"
        aria-label="Main"
        className={`absolute inset-x-0 top-full flex flex-col border-b border-line bg-background/95 px-[7%] pb-4 pt-2 shadow-[0_16px_28px_rgba(41,39,33,0.1)] backdrop-blur-md transition duration-200
          md:visible md:static md:translate-y-0 md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:opacity-100 md:shadow-none md:backdrop-blur-none
          ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/account"
          aria-label="Account"
          className="grid size-[42px] place-items-center rounded-full border border-[#aaa295] transition hover:border-foreground hover:bg-foreground hover:text-white"
        >
          <svg
            className="size-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </Link>
        <Link
          href="/cart"
          aria-label={`Bag, ${count} items`}
          className="relative inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2.5 text-[13px] font-semibold text-white transition hover:-translate-y-px hover:bg-accent-dark md:px-[18px]"
        >
          <BagIcon />
          <span className="hidden md:inline">Bag</span>
          {count > 0 && (
            <span className="absolute -right-1 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-accent px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex size-[42px] flex-col justify-center gap-[5px] rounded-full border border-[#aaa295] px-[11px] md:hidden"
        >
          <span className={`block h-0.5 rounded bg-foreground transition ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-0.5 rounded bg-foreground transition ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 rounded bg-foreground transition ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </div>
    </header>
  );
}