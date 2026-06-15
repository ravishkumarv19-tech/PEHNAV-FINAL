import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { collections, products } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export const Route = createFileRoute("/collections/$id")({
  loader: ({ params }) => {
    const collection = collections.find((c) => c.id === params.id);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.collection.name.en} — PEHNAV` },
          { name: "description", content: loaderData.collection.description.en },
          { property: "og:title", content: `${loaderData.collection.name.en} — PEHNAV` },
          { property: "og:image", content: loaderData.collection.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="px-6 py-32 text-center"><h1 className="font-display text-3xl font-bold">Collection not found</h1><Link to="/collections" className="mt-4 inline-block text-gold underline">All collections</Link></div>
  ),
  errorComponent: () => <div className="px-6 py-32 text-center">Something went wrong.</div>,
  component: CollectionPage,
});

function CollectionPage() {
  const { collection } = Route.useLoaderData();
  const { tl } = useI18n();
  const items = products.filter((p) => p.collection === collection.id);

  return (
    <div>
      <section className="relative h-[55vh] min-h-[380px] overflow-hidden">
        <img src={collection.image} alt={tl(collection.name)} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-12 text-background">
          <p className="eyebrow text-beige">{tl(collection.tagline)}</p>
          <h1 className="mt-2 font-display text-5xl font-bold sm:text-7xl">{tl(collection.name)}</h1>
          <p className="mt-3 max-w-lg text-background/80">{tl(collection.description)}</p>
        </div>
      </section>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.length ? items.map((p) => <ProductCard key={p.id} product={p} />) : <p className="text-muted-foreground">Coming soon.</p>}
        </div>
      </div>
    </div>
  );
}
