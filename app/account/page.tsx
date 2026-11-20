import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import SignOutButton from "@/components/auth/SignOutButton";
import { requireUser } from "@/lib/authorization";

export const instant = false;

export default async function AccountPage() {
  const session = await requireUser();

  return (
    <main>
      <Navbar />
      <section className="mx-auto w-full max-w-2xl px-5 py-12 md:py-20">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">YOUR ACCOUNT</p>
        <h1 className="mb-8 mt-2 font-serif text-[clamp(34px,6vw,48px)]">Account</h1>

        <div className="rounded-xl border border-line bg-card p-5 md:p-7">
          <dl className="grid gap-5 text-sm">
            <div>
              <dt className="text-xs font-semibold text-muted">Name</dt>
              <dd className="mt-1">{session.user.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Email</dt>
              <dd className="mt-1">{session.user.email}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {session.user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex bg-foreground px-5 py-3 text-xs font-bold tracking-[1px] text-white transition hover:bg-accent-dark"
              >
                STORE ADMIN
              </Link>
            )}
            <Link
              href="/orders"
              className="inline-flex border border-foreground px-5 py-3 text-xs font-bold tracking-[1px] transition hover:bg-foreground hover:text-white"
            >
              VIEW ORDERS
            </Link>
            <SignOutButton />
          </div>
        </div>
      </section>
    </main>
  );
}
