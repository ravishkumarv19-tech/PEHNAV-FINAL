import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { collections, IMAGES, type Product } from "@/lib/data";
import { COLLECTION_IMAGES, campaignImg } from "@/lib/assets";
import { fetchAllProducts } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export const Route = createFileRoute("/collections/$id")({
  loader: ({ params }) => {
    const collection = collections.find((c) => c.id === params.id);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.collection.name.en} — PEHNAV` },
      { name: "description", content: loaderData.collection.description.en },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Collection not found</h1>
      <Link to="/collections" className="mt-4 inline-block text-gold underline">All collections</Link>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const { collection } = Route.useLoaderData();
  const { tl } = useI18n();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then((all) => setItems(all.filter((p) => p.collection === collection.id)))
      .finally(() => setLoading(false));
  }, [collection.id]);

  const heroImg = COLLECTION_IMAGES[collection.id] || collection.image || campaignImg;

  return (
    <div>
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <img src={heroImg} alt={tl(collection.name)}
          onError={(e) => { (e.target as HTMLImageElement).src = IMAGES.campaignImg; }}
          className="absolute inset-0 h-[115%] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-14 text-background">
          <p className="eyebrow text-gold/80">{tl(collection.tagline)}</p>
          <h1 className="mt-2 font-display text-5xl font-black sm:text-7xl">{tl(collection.name)}</h1>
          <p className="mt-3 max-w-lg text-background/75 text-sm sm:text-base">{tl(collection.description)}</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No products in this collection yet.</p>
            <Link to="/shop" className="mt-4 inline-block text-gold underline text-sm">Browse all products</Link>
          </div>
        ) : (
          <>
            <p className="mb-8 text-sm text-muted-foreground">{items.length} pieces in this collection</p>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}