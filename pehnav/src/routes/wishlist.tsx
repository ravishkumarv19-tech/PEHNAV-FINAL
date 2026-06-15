import { createFileRoute, Link } from "@tanstack/react-router";
import { getProduct } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — PEHNAV" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const { t } = useI18n();
  const items = wishlist.map(getProduct).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <h1 className="font-display text-4xl font-bold">{t("wishlist.title")}</h1>
      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">{t("wishlist.empty")}</p>
          <Link to="/shop" className="mt-6 inline-block rounded-md bg-foreground px-8 py-3 text-sm uppercase tracking-wider text-background">{t("cta.shop")}</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
