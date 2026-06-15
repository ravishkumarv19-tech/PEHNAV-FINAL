import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase, type DBProduct } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/data";

const TRENDING = ["Oversized Tee", "Cargo Pants", "Hoodies", "Knitwear", "Sneakers"];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { tl } = useI18n();
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);

    // Sanitize search query — remove SQL-special characters
    const safe = query.trim().replace(/[%_\\;'"]/g, "").slice(0, 100);
    if (!safe) { setResults([]); setLoading(false); return; }

    const t = setTimeout(async () => {
      // Use separate .or() with sanitized safe string — Supabase parameterizes ilike values
      const { data } = await supabase
        .from("products")
        .select("id, name_en, name_hi, price, compare_at, image_url, category, badge")
        .or(
          [
            `name_en.ilike.%${safe}%`,
            `name_hi.ilike.%${safe}%`,
            `category.ilike.%${safe}%`,
            `collection.ilike.%${safe}%`,
          ].join(",")
        )
        .eq("in_stock", true)
        .limit(6);
      setResults((data as DBProduct[]) ?? []);
      setCursor(-1);
      setLoading(false);
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard: escape closes, arrows move cursor, enter navigates
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, -1)); }
    if (e.key === "Enter") {
      if (cursor >= 0 && results[cursor]) {
        navigate({ to: `/products/${results[cursor].id}` });
        close();
      } else if (query.trim()) {
        navigate({ to: "/shop", search: { q: query } as any });
        close();
      }
    }
  };

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setCursor(-1);
  }, []);

  const openSearch = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Global keyboard shortcut: / to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const productName = (p: DBProduct) => {
    const lang = document.documentElement.lang === "hi" ? p.name_hi : p.name_en;
    return lang;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Search"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">/</kbd>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search products, styles, occasions…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0 text-muted-foreground" />}
            {!loading && query && (
              <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <ul className="max-h-72 overflow-y-auto">
              {results.map((p, i) => (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.id}`}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${cursor === i ? "bg-secondary" : "hover:bg-secondary/60"}`}
                  >
                    <img src={p.image_url} alt={productName(p)} className="h-12 w-10 flex-shrink-0 rounded-md object-cover border border-border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{productName(p)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
                      {p.badge && <span className="text-[10px] text-gold capitalize">{p.badge}</span>}
                    </div>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { navigate({ to: "/shop", search: { q: query } as any }); close(); }}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  See all results for "<strong>{query}</strong>"
                </button>
              </li>
            </ul>
          )}

          {/* No results */}
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products found for "<strong>{query}</strong>"
              <p className="mt-1 text-xs">Try a different term or browse the shop</p>
            </div>
          )}

          {/* Trending (empty state) */}
          {!query && (
            <div className="px-4 py-4">
              <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-gold hover:text-gold transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
