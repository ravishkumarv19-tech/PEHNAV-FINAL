import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { fetchAllProducts } from "@/lib/products";
import { categories, type Product, type Gender } from "@/lib/data";
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(4499);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState(search.q ?? "");

  // Load live products (Supabase merged with seeds)
  useEffect(() => {
    setLoadingProducts(true);
    fetchAllProducts()
      .then(setProducts)
      .finally(() => setLoadingProducts(false));
  }, []);

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
  }, [products, search, size, color, maxPrice, inStockOnly, query, tl]);

  const setSort = (sort: string) => navigate({ search: (p: ShopSearch) => ({ ...p, sort }) });

  const title = search.category
    ? tl(categories.find((c) => c.id === search.category)?.name ?? { en: "Shop", hi: "शॉप" })
    : search.gender
      ? t(`nav.${search.gender}` as never)
      : search.badge === "new" ? t("nav.new") : search.badge === "bestseller" ? t("nav.best") : "Shop All";

  const setCategory = (id: string | null) =>
    navigate({ search: (p: ShopSearch) => ({ ...p, category: id ?? undefined }) });

  const activeFilterCount =
    (search.category ? 1 : 0) +
    (size ? 1 : 0) +
    (color ? 1 : 0) +
    (maxPrice < 4499 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const resetAllFilters = () => {
    setCategory(null);
    setSize(null);
    setColor(null);
    setMaxPrice(4499);
    setInStockOnly(false);
  };

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="eyebrow mb-3 text-cyan font-bold tracking-wider">Category</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCategory(null)}
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
              !search.category
                ? "font-bold text-cyan bg-cyan/10"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(search.category === c.id ? null : c.id)}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                search.category === c.id
                  ? "font-bold text-cyan bg-cyan/10"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <span>{tl(c.name)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="eyebrow mb-2 text-cyan font-bold tracking-wider">{t("filter.price")}</h3>
        <input
          type="range"
          min={499}
          max={4499}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="w-full accent-cyan"
        />
        <div className="mt-1 flex justify-between text-xs font-mono text-muted-foreground">
          <span>₹499</span>
          <span className="font-bold text-foreground">Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="eyebrow mb-2.5 text-cyan font-bold tracking-wider">{t("filter.size")}</h3>
        <div className="flex flex-wrap gap-1.5">
          {allSizes.map((s) => (
            <button
              key={s}
              onClick={() => setSize(size === s ? null : s)}
              className={`min-h-[36px] min-w-9 rounded-md border px-2.5 py-1 text-xs font-mono font-medium transition-all ${
                size === s
                  ? "border-cyan bg-cyan text-black font-bold shadow-xs"
                  : "border-border text-muted-foreground hover:border-foreground/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="eyebrow mb-2.5 text-cyan font-bold tracking-wider">{t("filter.color")}</h3>
        <div className="flex gap-2.5">
          {allColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(color === c ? null : c)}
              style={{ backgroundColor: c }}
              className={`min-h-[36px] min-w-[36px] h-8 w-8 rounded-full border-2 transition-all ${
                color === c ? "ring-2 ring-cyan ring-offset-2 scale-110 border-foreground" : "border-border hover:scale-105"
              }`}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="flex items-center gap-3 text-sm cursor-pointer py-1">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-cyan"
          />
          <span className="font-medium text-foreground">{t("filter.availability")} (In Stock)</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 pb-28 sm:pb-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase">{title}</h1>
      <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-mono">
        {loadingProducts ? "Loading…" : `${filtered.length} ${t("common.results")}`}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("common.search")}
          className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-cyan sm:max-w-xs transition-colors"
        />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex-1 sm:flex-none inline-flex min-h-[42px] items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-cyan" />
            <span>{t("filter.title")}</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan text-[10px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={search.sort ?? "featured"}
            onChange={(e) => setSort(e.target.value)}
            className="min-h-[42px] rounded-md border border-border bg-card px-3 sm:px-4 py-2 text-sm outline-none focus:border-cyan cursor-pointer"
          >
            <option value="featured">{t("sort.featured")}</option>
            <option value="priceLow">{t("sort.priceLow")}</option>
            <option value="priceHigh">{t("sort.priceHigh")}</option>
            <option value="rating">{t("sort.rating")}</option>
          </select>
        </div>
      </div>

      {/* Active filters pill bar */}
      {activeFilterCount > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-mono uppercase text-[10px]">Active Filters:</span>
          {search.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs border border-border">
              Cat: {search.category}
              <button onClick={() => setCategory(null)} className="hover:text-cyan ml-0.5">✕</button>
            </span>
          )}
          {size && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs border border-border">
              Size: {size}
              <button onClick={() => setSize(null)} className="hover:text-cyan ml-0.5">✕</button>
            </span>
          )}
          {color && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs border border-border">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <button onClick={() => setColor(null)} className="hover:text-cyan ml-0.5">✕</button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs border border-border">
              In Stock
              <button onClick={() => setInStockOnly(false)} className="hover:text-cyan ml-0.5">✕</button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-[11px] font-mono text-cyan hover:underline flex items-center gap-1 ml-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in" onClick={() => setShowFilters(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl border-t border-border bg-background p-6 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-cyan" />
                <h3 className="font-display text-lg font-bold">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-cyan px-2 py-0.5 text-[10px] font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-cyan hover:underline"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-2 hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-5">
              {FilterContent}
            </div>

            <div className="pt-4 border-t border-border pb-[max(env(safe-area-inset-bottom,0px),10px)]">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full rounded-xl bg-foreground py-3.5 text-center text-sm font-bold uppercase tracking-wider text-background shadow-lg active:scale-95 transition-transform"
              >
                Show {filtered.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block space-y-8 sticky top-24 h-fit">
          <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur-md">
            {FilterContent}
          </div>
        </aside>

        <div>
          {loadingProducts ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-cyan" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-base font-medium">No products match your filters.</p>
              <button
                onClick={resetAllFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-background hover:bg-cyan hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
