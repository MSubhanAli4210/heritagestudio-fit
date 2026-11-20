import Navbar from "@/components/layout/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/authorization";

export const instant = false;

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main>
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-[7%] md:py-16">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">HERITAGE STUDIO</p>
        <h1 className="mt-2 font-serif text-[clamp(36px,5vw,54px)]">Store admin</h1>
        <p className="mb-8 mt-3 max-w-2xl text-sm leading-6 text-muted">
          Manage your catalog, pricing, sales, and checkout coupons.
        </p>
        <AdminDashboard />
      </section>
    </main>
  );
}
