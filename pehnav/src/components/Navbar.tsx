import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { User, Heart, ShoppingBag, Menu, X, ChevronDown, Search, ArrowRight, Sparkles, Flame, ShieldCheck, Layers, Tag, Compass, Package, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { categories, products, collections, formatPrice } from "@/lib/data";
import MobileBottomBar from "@/components/MobileBottomBar";

interface MegaGroup {
  label: string;
  search?: Record<string, string>;
  items: { label: string; to: string; search?: Record<string, string> }[];
}

const MEGA: Record<string, MegaGroup[]> = {
  Shop: [
    {
      label: "Gender",
      items: [
        { label: "Men", to: "/shop", search: { gender: "men" } },
        { label: "Women", to: "/shop", search: { gender: "women" } },
        { label: "Unisex", to: "/shop", search: { gender: "unisex" } },
      ],
    },
    {
      label: "New In",
      items: [
        { label: "New Arrivals", to: "/shop", search: { badge: "new" } },
        { label: "Best Sellers", to: "/shop", search: { badge: "bestseller" } },
        { label: "Limited Edition", to: "/shop", search: { badge: "limited" } },
      ],
    },
    {
      label: "Apparel",
      items: [
        { label: "T-Shirts", to: "/shop", search: { category: "tees" } },
        { label: "Shirts", to: "/shop", search: { category: "shirts" } },
        { label: "Hoodies", to: "/shop", search: { category: "hoodies" } },
        { label: "Jackets", to: "/shop", search: { category: "jackets" } },
        { label: "Cargo Pants", to: "/shop", search: { category: "cargo" } },
        { label: "Denim", to: "/shop", search: { category: "denim" } },
      ],
    },
    {
      label: "Accessories",
      items: [
        { label: "Sneakers", to: "/shop", search: { category: "sneakers" } },
        { label: "Bags", to: "/shop", search: { category: "bags" } },
        { label: "Caps", to: "/shop", search: { category: "caps" } },
        { label: "Eyewear", to: "/shop", search: { category: "eyewear" } },
        { label: "Watches", to: "/shop", search: { category: "watches" } },
      ],
    },
  ],
  Collections: [
    {
      label: "Our Chapters",
      items: [
        { label: "Dreamers — Chapter I", to: "/collections/$id", search: { id: "dreamers" } as any },
        { label: "Hustlers — Chapter II", to: "/collections/$id", search: { id: "hustlers" } as any },
        { label: "Creators — Chapter III", to: "/collections/$id", search: { id: "creators" } as any },
        { label: "Wanderers — Chapter IV", to: "/collections/$id", search: { id: "wanderers" } as any },
      ],
    },
  ],
};

const TOP_NAV = [
  { label: "Shop", to: "/shop", hasMega: true },
  { label: "Collections", to: "/collections", hasMega: true },
  { label: "Our Story", to: "/stories", hasMega: false },
  { label: "Contact", to: "/contact", hasMega: false },
];

export default function Navbar() {
  const { lang, setLang, tl } = useI18n();
  const { cartCount, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const prevCartCount = useRef(cartCount);
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cartCount > prevCartCount.current) setCartBounceKey((k) => k + 1);
    prevCartCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mega on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const megaGroups = megaOpen ? MEGA[megaOpen] : null;

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress-bar"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-luxury border-b border-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
            : "bg-background/90 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div ref={megaRef} className="relative">
          {/* Main bar */}
          <div className="mx-auto flex h-[64px] max-w-[1400px] items-center justify-between px-5 sm:px-8">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden -ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-foreground active:scale-95 transition-transform"
              onClick={() => setOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={() => setMegaOpen(null)}
              className="group flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <span className="font-display text-2xl font-black tracking-[0.24em] text-foreground transition-colors group-hover:text-cyan">
                PEHNAV
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan inline-block animate-pulse" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {TOP_NAV.map((item) => (
                <div key={item.label} className="relative">
                  {item.hasMega ? (
                    <button
                      onMouseEnter={() => setMegaOpen(item.label)}
                      onClick={() => setMegaOpen(megaOpen === item.label ? null : item.label)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all ${
                        megaOpen === item.label ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${megaOpen === item.label ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.to}
                      onMouseEnter={() => setMegaOpen(null)}
                      className="underline-draw block rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60"
                      activeProps={{ className: "underline-draw block rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground bg-secondary/80 font-bold" }}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Language toggle pill */}
              <div className="hidden items-center rounded-full border border-border/80 bg-secondary/40 p-0.5 text-[10px] font-bold sm:flex">
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-full px-2.5 py-0.5 transition-all ${lang === "en" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("hi")}
                  className={`rounded-full px-2.5 py-0.5 transition-all ${lang === "hi" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                >
                  हिं
                </button>
              </div>

              {/* Quick Search */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="flex min-h-[44px] min-w-[44px] sm:h-9 sm:w-auto items-center justify-center gap-2 rounded-full border border-transparent px-2.5 sm:px-3 text-muted-foreground transition-all hover:border-border hover:bg-secondary/70 hover:text-foreground active:scale-95"
                aria-label="Search"
                title="Search (Cmd+K / Ctrl+K)"
              >
                <Search className="h-4 w-4" />
                <span className="hidden text-xs text-muted-foreground/80 sm:inline">Search...</span>
                <kbd className="hidden rounded bg-background/80 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground border border-border/70 lg:inline">
                  ⌘K
                </kbd>
              </button>

              <Link
                to="/account"
                aria-label="Account"
                className="flex min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <User className="h-4 w-4" />
              </Link>

              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <Heart className="h-4 w-4" />
                {wishlist.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan text-[8px] font-bold text-black shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                aria-label="Cart"
                data-cart-icon="true"
                className="relative flex min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span
                    key={cartBounceKey}
                    className={`absolute right-1.5 top-1.5 sm:right-0.5 sm:top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan text-[9px] font-black text-black shadow-md ${cartBounceKey > 0 ? "animate-cart-bounce" : ""}`}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* ── Luxury Spacious Floating Mega Menu: Shop ── */}
          {megaOpen === "Shop" && (
            <div
              className="mega-menu absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[calc(100vw-40px)] max-w-5xl z-50 rounded-2xl border border-white/10 bg-[#090b0e]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-8 sm:p-10 animate-fade-up overflow-hidden"
              onMouseLeave={() => setMegaOpen(null)}
            >
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10">
                {/* Col 1: HIGHLIGHTS */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold/90 font-bold mb-4">
                    Highlights
                  </p>
                  <ul className="space-y-3.5 text-sm">
                    {[
                      { label: "New Arrivals", to: "/shop", search: { badge: "new" } },
                      { label: "Best Sellers", to: "/shop", search: { badge: "bestseller" } },
                      { label: "Limited Edition", to: "/shop", search: { badge: "limited" } },
                      { label: "Men's Collection", to: "/shop", search: { gender: "men" } },
                      { label: "Women's Collection", to: "/shop", search: { gender: "women" } },
                      { label: "Unisex Silhouettes", to: "/shop", search: { gender: "unisex" } },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to as any}
                          search={item.search as any}
                          onClick={() => setMegaOpen(null)}
                          className="text-gray-300 hover:text-white transition-colors block py-0.5 tracking-wide text-[13px] hover:translate-x-1 transition-transform duration-200"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 2: APPAREL */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold/90 font-bold mb-4">
                    Apparel
                  </p>
                  <ul className="space-y-3.5 text-sm">
                    {[
                      { label: "Heavyweight Tees", to: "/shop", search: { category: "tees" } },
                      { label: "Hoodies & Sweats", to: "/shop", search: { category: "hoodies" } },
                      { label: "Boxy Shirts", to: "/shop", search: { category: "shirts" } },
                      { label: "Tactical Cargos", to: "/shop", search: { category: "cargo" } },
                      { label: "Architectural Denim", to: "/shop", search: { category: "denim" } },
                      { label: "Outerwear & Jackets", to: "/shop", search: { category: "jackets" } },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to as any}
                          search={item.search as any}
                          onClick={() => setMegaOpen(null)}
                          className="text-gray-300 hover:text-white transition-colors block py-0.5 tracking-wide text-[13px] hover:translate-x-1 transition-transform duration-200"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 3: ACCESSORIES */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold/90 font-bold mb-4">
                    Accessories
                  </p>
                  <ul className="space-y-3.5 text-sm">
                    {[
                      { label: "Platform Sneakers", to: "/shop", search: { category: "sneakers" } },
                      { label: "Crossbody Bags", to: "/shop", search: { category: "bags" } },
                      { label: "Structured Caps", to: "/shop", search: { category: "caps" } },
                      { label: "Minimalist Eyewear", to: "/shop", search: { category: "eyewear" } },
                      { label: "Luxury Timepieces", to: "/shop", search: { category: "watches" } },
                    ].map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to as any}
                          search={item.search as any}
                          onClick={() => setMegaOpen(null)}
                          className="text-gray-300 hover:text-white transition-colors block py-0.5 tracking-wide text-[13px] hover:translate-x-1 transition-transform duration-200"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 4: EDITORIAL SPOTLIGHT */}
                <div>
                  <Link
                    to="/shop"
                    search={{ badge: "new" } as any}
                    onClick={() => setMegaOpen(null)}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-black transition-all hover:border-gold/50"
                  >
                    <img
                      src="/assets/modern-hero.jpg"
                      alt="New Season Drop"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-gold uppercase mb-1">
                        New Season
                      </span>
                      <p className="font-display text-base font-bold text-white group-hover:text-gold transition-colors">
                        The Obsidian Drop
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        Shop Now <ArrowRight className="h-3 w-3 text-gold inline transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Clean, minimalist bottom footer */}
              <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono gap-4">
                <span>Free express shipping on orders over ₹1,999</span>
                <Link
                  to="/shop"
                  onClick={() => setMegaOpen(null)}
                  className="text-white hover:text-gold font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  View Full Catalog <ArrowRight className="h-3.5 w-3.5 text-gold" />
                </Link>
              </div>
            </div>
          )}

          {/* ── Luxury Spacious Floating Mega Menu: Collections ── */}
          {megaOpen === "Collections" && (
            <div
              className="mega-menu absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[calc(100vw-40px)] max-w-5xl z-50 rounded-2xl border border-white/10 bg-[#090b0e]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-8 sm:p-10 animate-fade-up overflow-hidden"
              onMouseLeave={() => setMegaOpen(null)}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan/90 font-bold">The Chapters</p>
                  <h3 className="font-display text-xl font-bold text-white mt-1">Core Collections</h3>
                </div>
                <Link
                  to="/collections"
                  onClick={() => setMegaOpen(null)}
                  className="text-xs font-mono text-muted-foreground hover:text-white transition-colors flex items-center gap-1"
                >
                  All Collections <ArrowRight className="h-3 w-3 text-cyan" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {collections.map((c) => (
                  <Link
                    key={c.id}
                    to="/collections/$id"
                    params={{ id: c.id }}
                    onClick={() => setMegaOpen(null)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-black transition-all hover:border-gold/60"
                  >
                    <img
                      src={c.image}
                      alt={tl(c.name)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gold font-bold">
                        {c.id.toUpperCase()}
                      </span>
                      <h4 className="font-display text-base font-bold group-hover:text-gold transition-colors mt-0.5">
                        {tl(c.name)}
                      </h4>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                        {tl(c.tagline)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Search Overlay Modal */}
          {searchOpen && (
            <div className="border-t border-border/80 glass-luxury px-6 sm:px-8 py-4 shadow-xl animate-fade-up">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 flex-shrink-0 text-gold" />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
                        setSearchOpen(false);
                      }
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                    placeholder="Search tees, hoodies, cargos, collections (press Enter)..."
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear
                    </button>
                  )}
                  <button onClick={() => setSearchOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Suggestions list */}
                {searchResults.length > 0 && (
                  <div className="mt-4 border-t border-border/60 pt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matching Items</p>
                    <div className="grid gap-2">
                      {searchResults.map((p) => (
                        <Link
                          key={p.id}
                          to="/products/$id"
                          params={{ id: p.id }}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary"
                        >
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={tl(p.name)} className="h-10 w-10 rounded-md object-cover" />
                            <div>
                              <p className="text-xs font-semibold">{tl(p.name)}</p>
                              <p className="text-[10px] text-muted-foreground">{p.category}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gold">{formatPrice(p.price)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] animate-fade-in" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 h-full w-[310px] overflow-y-auto bg-background p-6 shadow-2xl animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-black tracking-[0.22em]">PEHNAV</span>
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile nav */}
            <nav className="space-y-1">
              {TOP_NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold tracking-wide transition-colors hover:bg-secondary"
                  activeProps={{ className: "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-bold bg-secondary text-foreground" }}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </nav>

            <div className="mt-6 border-t border-border pt-6 space-y-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Filters</p>
              {[
                ["Men's Apparel", "/shop", { gender: "men" }],
                ["Women's Apparel", "/shop", { gender: "women" }],
                ["New Drops", "/shop", { badge: "new" }],
                ["Bestsellers", "/shop", { badge: "bestseller" }],
              ].map(([label, to, search]) => (
                <Link
                  key={label as string}
                  to={to as any}
                  search={search as any}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {label as string}
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-6 space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Account & Help</p>
              <Link
                to="/account"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span>My Profile & Orders</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/track"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span>Track Your Order</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/size-guide"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span>Interactive Size Guide</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/returns"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <span>7-Day Returns & Exchanges</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Language / भाषा</p>
              <div className="flex gap-2 px-3 pb-8">
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 rounded-full border py-2 text-xs font-bold transition-all ${lang === "en" ? "bg-foreground text-background border-foreground shadow-sm" : "border-border text-muted-foreground"}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("hi")}
                  className={`flex-1 rounded-full border py-2 text-xs font-bold transition-all ${lang === "hi" ? "bg-foreground text-background border-foreground shadow-sm" : "border-border text-muted-foreground"}`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar onSearchClick={() => setSearchOpen(true)} />
    </>
  );
}
