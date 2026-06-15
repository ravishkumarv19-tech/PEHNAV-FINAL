import { createFileRoute, Link } from "@tanstack/react-router";
import { IMAGES, collections } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/stories")({
  head: () => ({ meta: [{ title: "Stories — PEHNAV", }, { name: "description", content: "The PEHNAV universe: stories behind every collection." }] }),
  component: Stories,
});

function Stories() {
  const { tl } = useI18n();
  return (
    <div>
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={IMAGES.campaignImg} alt="PEHNAV stories" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 text-background">
          <p className="eyebrow text-beige">Wear Your Story</p>
          <h1 className="mt-2 max-w-2xl font-display text-5xl font-bold sm:text-7xl">Every thread has a tale.</h1>
        </div>
      </section>
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {collections.map((c) => (
            <Link key={c.id} to="/collections/$id" params={{ id: c.id }} className="group relative aspect-[16/10] overflow-hidden rounded-md">
              <img src={c.image} alt={tl(c.name)} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-background">
                <h2 className="font-display text-3xl font-bold">{tl(c.name)}</h2>
                <p className="mt-1 max-w-sm text-sm text-background/80">{tl(c.description)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
