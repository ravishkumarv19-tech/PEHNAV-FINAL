import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { collections } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/collections/")({
  head: () => ({ meta: [{ title: "Collections — PEHNAV" }, { name: "description", content: "Shop PEHNAV by story: Dreamers, Hustlers, Creators and Wanderers." }] }),
  component: Collections,
});

function Collections() {
  const { tl } = useI18n();
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <p className="eyebrow text-gold">Shop by Story</p>
      <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Collections</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {collections.map((col) => (
          <Link key={col.id} to="/collections/$id" params={{ id: col.id }} className="group relative aspect-[16/10] overflow-hidden rounded-md">
            <img src={col.image} alt={tl(col.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-background">
              <p className="eyebrow text-beige">{tl(col.tagline)}</p>
              <h2 className="mt-1 font-display text-3xl font-bold">{tl(col.name)}</h2>
              <span className="mt-3 inline-flex items-center gap-2 text-sm uppercase tracking-wider">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
