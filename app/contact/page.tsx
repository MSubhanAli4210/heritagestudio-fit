import Navbar from "@/components/layout/Navbar";

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-[7%] py-16 md:py-24">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">GET IN TOUCH</p>
        <h1 className="mt-3 font-serif text-[clamp(42px,7vw,72px)]">Contact the studio</h1>
        <div className="mt-8 max-w-xl rounded-xl border border-line p-6 text-sm leading-7 text-muted">
          <p>For custom orders and artwork questions, email tmoaiz1@gmail.com.</p>
        </div>
      </section>
    </main>
  );
}