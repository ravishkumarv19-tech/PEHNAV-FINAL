import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { categories, products, type Gender } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

interface ShopSearch {
  gender?: Gender;
  category?: string;
  badge?: string;
  q?: string;
  sort?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    gender: (s.gender as Gender) || undefined,
    category: (s.category as string) || undefined,
    badge: (s.badge as string) || undefined,
    q: (s.q as string) || undefined,
    sort: (s.sort as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All — PEHNAV" },
      { name: "description", content: "Browse the full PEHNAV catalog. Filter by gender, size, colour and price." },
    ],
  }),
  component: Shop,
});

const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "UK6", "UK7", "UK8", "UK9", "UK10", "UK11", "One Size"];
const allColors = ["#000000", "#F5F5F5", "#D8C3A5", "#BFA16A"];

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { t, tl } = useI18n();

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(4499);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(search.q ?? "");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (search.gender && p.gender !== search.gender) return false;
      if (search.category && p.category !== search.category) return false;
      if (search.badge && p.badge !== search.badge) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (color && !p.colors.includes(color)) return false;
      if (p.price > maxPrice) return false;
      if (inStockOnly && !p.inStock) return false;
      if (query && !tl(p.name).toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
    const sort = search.sort;
    if (sort === "priceLow") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceHigh") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, size, color, maxPrice, inStockOnly, query, tl]);

  const setSort = (sort: string) => navigate({ search: (p: ShopSearch) => ({ ...p, sort }) });

  const title = search.category
    ? tl(categories.find((c) => c.id === search.category)?.name ?? { en: "Shop", hi: "शॉप" })
    : search.gender
      ? t(`nav.${search.gender}` as never)
      : search.badge === "new" ? t("nav.new") : search.badge === "bestseller" ? t("nav.best") : "Shop All";

  const setCategory = (id: string | null) =>
    navigate({ search: (p: ShopSearch) => ({ ...p, category: id ?? undefined }) });

  const Filters = (
    <div className="space-y-8">
      <div>
        <h3 className="eyebrow mb-3 text-gold">Category</h3>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => setCategory(null)} className={`text-left text-sm ${!search.category ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}>All</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(search.category === c.id ? null : c.id)} className={`text-left text-sm ${search.category === c.id ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{tl(c.name)}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="eyebrow mb-3 text-gold">{t("filter.price")}</h3>
        <input type="range" min={499} max={4499} step={100} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-gold" />
        <p className="mt-1 text-sm text-muted-foreground">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
      </div>
      <div>
        <h3 className="eyebrow mb-3 text-gold">{t("filter.size")}</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => setSize(size === s ? null : s)} className={`min-w-9 rounded-md border px-2 py-1 text-xs ${size === s ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="eyebrow mb-3 text-gold">{t("filter.color")}</h3>
        <div className="flex gap-3">
          {allColors.map((c) => (
            <button key={c} onClick={() => setColor(color === c ? null : c)} style={{ backgroundColor: c }} className={`h-7 w-7 rounded-full border ${color === c ? "ring-2 ring-gold ring-offset-2" : "border-border"}`} aria-label={c} />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="accent-gold" />
        {t("filter.availability")}
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{filtered.length} {t("common.results")}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("common.search")} className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold sm:max-w-xs" />
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((v) => !v)} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> {t("filter.title")}
          </button>
          <select value={search.sort ?? "featured"} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-gold">
            <option value="featured">{t("sort.featured")}</option>
            <option value="priceLow">{t("sort.priceLow")}</option>
            <option value="priceHigh">{t("sort.priceHigh")}</option>
            <option value="rating">{t("sort.rating")}</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>{Filters}</aside>
        <div>
          {filtered.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
