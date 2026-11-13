import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link href="/" className="brand">
        HEURISTIC<span>STUDIO</span>
      </Link>

      <nav className="nav-links">
        <Link href="/shop">Shop</Link>
        <Link href="/customize">Customize</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <Link href="/cart" className="cart-link">
        Bag (0)
      </Link>
    </header>
  );
}