import { Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import SearchBar from "./SearchBar";

const links = [
  { to: "/", key: "nav.home" as const },
  { to: "/shop", key: "nav.men" as const, search: { gender: "men" } },
  { to: "/shop", key: "nav.women" as const, search: { gender: "women" } },
  { to: "/shop", key: "nav.unisex" as const, search: { gender: "unisex" } },
  { to: "/collections", key: "nav.collections" as const },
  { to: "/shop", key: "nav.new" as const, search: { badge: "new" } },
  { to: "/shop", key: "nav.best" as const, search: { badge: "bestseller" } },
  { to: "/stories", key: "nav.stories" as const },
  { to: "/blog", key: "nav.blog" as const },
  { to: "/contact", key: "nav.contact" as const },
];

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { cartCount, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const prevCartCount = useRef(cartCount);
  const [cartBounceKey, setCartBounceKey] = useState(0);

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounceKey((k) => k + 1);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-background border-b ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="font-display text-2xl font-bold tracking-[0.18em]">
          PEHNAV
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.to}
              search={l.search as never}
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden items-center rounded-full border border-border text-xs sm:flex">
            <button
              onClick={() => setLang("en")}
              className={`rounded-full px-2.5 py-1 ${lang === "en" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`rounded-full px-2.5 py-1 ${lang === "hi" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              हिं
            </button>
          </div>
          <SearchBar />
          <Link to="/account" aria-label="Account" className="hover:text-gold"><User className="h-5 w-5" /></Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-gold">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background">{wishlist.length}</span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative hover:text-gold" data-cart-icon="true">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span
                key={cartBounceKey}
                className={`absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background ${cartBounceKey > 0 ? "animate-cart-bounce" : ""}`}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-foreground/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-6 shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-xl font-bold tracking-[0.18em]">PEHNAV</span>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-4">
              {links.map((l) => (
                <Link key={l.key} to={l.to} search={l.search as never} onClick={() => setOpen(false)} className="text-sm uppercase tracking-wider">
                  {t(l.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex gap-2">
              <button onClick={() => setLang("en")} className={`rounded-full border px-3 py-1 text-xs ${lang === "en" ? "bg-foreground text-background" : ""}`}>EN</button>
              <button onClick={() => setLang("hi")} className={`rounded-full border px-3 py-1 text-xs ${lang === "hi" ? "bg-foreground text-background" : ""}`}>हिंदी</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
