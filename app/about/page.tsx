import Navbar from "@/components/layout/Navbar";

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-[7%] max-w-3xl py-16 md:py-24">
        <p className="text-[10px] font-bold tracking-[3px] text-accent">OUR STUDIO</p>
        <h1 className="mt-3 font-serif text-[clamp(42px,7vw,72px)] leading-tight">Wear Your Own Expression.</h1>
        <p className="mt-7 max-w-2xl text-sm leading-8 text-muted">
          Heritage Studio creates premium everyday apparel and one-of-a-kind pieces that carry your own ideas.
          Choose a garment, upload your artwork, preview it, and make it yours.
        </p>
      </section>
    </main>
  );
}