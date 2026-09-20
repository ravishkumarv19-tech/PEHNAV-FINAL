import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Heart, Minus, Plus, Star, Truck, RefreshCw, Shield,
  ShoppingBag, Check, Loader2, Zap, Ruler,
} from "lucide-react";
import { fetchProduct, fetchAllProducts } from "@/lib/products";
import { formatPrice, type Product, IMAGES } from "@/lib/data";
import { A } from "@/lib/assets";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import SizeGuideModal from "@/components/SizeGuideModal";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);
    if (!product) throw notFound();
    const all = await fetchAllProducts();
    return { product, all };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name.en} — PEHNAV ARCHIVE` },
          { name: "description", content: loaderData.product.description.en },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-cyan underline">Back to shop</Link>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
  component: PDP,
});

type Tab = "story" | "desc" | "specs" | "reviews";

// Named color lookup
const COLOR_NAMES: Record<string, string> = {
  "#000000": "Black", "#1a1a1a": "Charcoal", "#FFFFFF": "White", "#F5F5F5": "Off White",
  "#ECF0F1": "Ivory", "#95A5A6": "Grey", "#D8C3A5": "Beige", "#BFA16A": "Gold",
  "#8B4513": "Brown", "#34495E": "Navy", "#2F4F4F": "Dark Slate", "#708090": "Slate Grey",
  "#2980B9": "Blue", "#27AE60": "Green", "#C0392B": "Red", "#E67E22": "Orange",
  "#9B59B6": "Purple", "#F39C12": "Amber", "#E91E63": "Pink", "#00BCD4": "Teal",
};

function getColorName(hex: string, customColors?: { hex: string; name: string }[]): string {
  // First check custom colors (admin-defined names take priority)
  const custom = customColors?.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
  if (custom) return custom.name;
  return COLOR_NAMES[hex] ?? COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

// Key Highlights
function KeyHighlightsCard({ highlights, image }: {
  highlights: { label: string; value: string }[];
  image?: string;
}) {
  if (!highlights || highlights.length === 0) return null;
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-secondary/50 border-b border-border">
        <Zap className="h-4 w-4 text-cyan flex-shrink-0" />
        <p className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-cyan">KEY HIGHLIGHTS</p>
      </div>

      {/* Content grid */}
      <div className="flex">
        {/* Highlights list */}
        <ul className="flex-1 divide-y divide-border/60">
          {highlights.map((h, i) => (
            <li key={i} className="px-5 py-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{h.label}</p>
              <p className="mt-0.5 text-sm font-bold text-foreground leading-snug">{h.value}</p>
            </li>
          ))}
        </ul>

        {/* Product image overlay */}
        {image && image !== IMAGES.placeholder && (
          <div className="relative w-28 flex-shrink-0 self-stretch overflow-hidden">
            <img
              src={image}
              alt="Product"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              style={{ filter: "brightness(0.7)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card" />
          </div>
        )}
      </div>
    </div>
  );
}

function PDP() {
  const { product, all } = Route.useLoaderData();
  const { t, tl } = useI18n();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { cartToast, wishlistToast } = useToast();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");

  // When a color is selected, switch gallery to that color's images
  const getGalleryForColor = (hex: string, prod: Product = product): string[] => {
    if (!hex || !prod.colorImages || prod.colorImages.length === 0) {
      return prod.gallery?.length ? prod.gallery : [prod.image];
    }
    const entry = prod.colorImages.find((ci: any) =>
      ci.hex.toUpperCase() === hex.toUpperCase()
    );
    if (entry && entry.images && entry.images.length > 0) return entry.images;
    return prod.gallery?.length ? prod.gallery : [prod.image];
  };

  const [activeGallery, setActiveGallery] = useState(() => getGalleryForColor(product.colors[0] ?? "", product));

  // Reset all PDP state and scroll to top when product ID changes
  useEffect(() => {
    setActiveImg(0);
    const initialColor = product.colors[0] ?? "";
    setColor(initialColor);
    setSize(product.sizes[1] ?? product.sizes[0] ?? "");
    setQty(1);
    setActiveGallery(getGalleryForColor(initialColor, product));
    setTab("story");
    window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus();
  }, [product.id]);

  const handleColorSelect = (hex: string) => {
    setColor(hex);
    setActiveImg(0);
    setActiveGallery(getGalleryForColor(hex, product));
  };
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("story");
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product, size, color, qty);
    cartToast(tl(product.name), product.image);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    const nowSaved = !inWishlist(product.id);
    toggleWishlist(product.id);
    wishlistToast(tl(product.name), nowSaved);
  };

  const gallery = activeGallery;
  const related = all.filter((p: Product) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fbt = all.filter((p: Product) => p.id !== product.id).slice(0, 2);

  const hasHighlights = product.highlights && product.highlights.length > 0;
  const hasSpecs = product.specs && product.specs.length > 0;
  const hasStory = tl(product.story)?.trim().length > 0;
  const hasDesc = tl(product.description)?.trim().length > 0;

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "story",   label: "The Story",      show: hasStory },
    { key: "desc",    label: "Description",    show: hasDesc  },
    { key: "specs",   label: "Specifications", show: hasSpecs },
    { key: "reviews", label: "Reviews",        show: true     },
  ];
  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-10 pb-32 sm:pb-10">
      <div className="grid gap-10 lg:grid-cols-2">

        {/* ── Gallery ── */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {/* Thumbnails */}
          <div className="flex gap-2 sm:flex-col sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-18 w-14 sm:h-20 sm:w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all touch-manipulation ${activeImg === i ? "border-cyan shadow-md scale-105" : "border-border hover:border-cyan/40"}`}
              >
                <img
                  src={img || A.tee}
                  alt=""
                  onError={(e) => { (e.target as HTMLImageElement).src = A.tee; }}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="group relative flex-1 overflow-hidden rounded-md bg-card border border-border">
            <img
              key={`${product.id}-${activeImg}-${color}`}
              src={gallery[activeImg] || product.image || A.tee}
              alt={tl(product.name)}
              onError={(e) => { (e.target as HTMLImageElement).src = A.tee; }}
              style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.badge && (
              <span className="absolute left-3 top-3 rounded-md bg-cyan px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-black">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* ── Details ── */}
        <div>
          {product.collection && (
            <p className="eyebrow text-cyan font-mono capitalize">{product.collection}</p>
          )}
          <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-3xl font-black sm:text-4xl outline-none uppercase">{tl(product.name)}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm font-mono">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-cyan text-cyan" />
              {product.rating}
            </span>
            <span className="text-muted-foreground">({product.reviews ?? product.reviewCount ?? 0} reviews)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-black">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <>
                <span className="text-muted-foreground line-through font-mono">{formatPrice(product.compareAt)}</span>
                <span className="rounded bg-cyan/20 px-2 py-0.5 text-xs font-mono font-bold text-cyan">
                  {Math.round((1 - product.price / product.compareAt) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Key Highlights — shown right under price for instant visibility */}
          <KeyHighlightsCard highlights={product.highlights ?? []} image={gallery[activeImg]} />

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">
                Color
                {color && (
                  <span className="ml-2 text-xs font-normal normal-case text-muted-foreground capitalize">
                    {getColorName(color, product.customColors)}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    title={getColorName(c, product.customColors)}
                    onClick={() => handleColorSelect(c)}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      style={{ backgroundColor: c }}
                      className={`block h-8 w-8 rounded-full border-2 transition-all ${color === c ? "border-gold ring-2 ring-gold ring-offset-2 scale-110" : "border-border hover:border-foreground/50"}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {getColorName(c, product.customColors)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow">Size</p>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-foreground underline transition-colors cursor-pointer font-medium"
                >
                  <Ruler className="h-3.5 w-3.5" /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-[44px] min-h-[44px] rounded-md border px-3.5 py-2 text-sm font-semibold transition-all touch-manipulation active:scale-95 ${
                      size === s
                        ? "border-foreground bg-foreground text-background shadow-sm"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Wishlist */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-secondary touch-manipulation active:scale-95">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-mono">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(q + 1, product.stock ?? 10))} className="p-3 hover:bg-secondary touch-manipulation active:scale-95">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={handleWishlist} className="flex h-12 w-12 items-center justify-center rounded-md border border-border hover:bg-secondary touch-manipulation active:scale-95">
              <Heart className={`h-5 w-5 transition-colors ${inWishlist(product.id) ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          {/* CTAs */}
          <div ref={ctaRef} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-4 text-sm font-medium uppercase tracking-wider transition-all touch-manipulation active:scale-[0.98] ${addedToCart ? "border-gold bg-gold/10 text-gold" : "border-foreground hover:bg-foreground hover:text-background"}`}
            >
              {addedToCart ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingBag className="h-4 w-4" /> Add to Bag</>}
            </button>
            <Link
              to="/cart"
              onClick={() => addToCart(product, size, color, qty)}
              className="flex flex-1 items-center justify-center rounded-md bg-foreground py-4 text-sm font-medium uppercase tracking-wider text-background hover:-translate-y-0.5 active:scale-[0.98] transition-transform touch-manipulation"
            >
              Buy Now
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1"><Truck className="h-5 w-5 text-gold" />Free Shipping</div>
            <div className="flex flex-col items-center gap-1"><RefreshCw className="h-5 w-5 text-gold" />7-Day Returns</div>
            <div className="flex flex-col items-center gap-1"><Shield className="h-5 w-5 text-gold" />Secure Payment</div>
          </div>

        </div>
      </div>

      {/* ── Tabs ── */}
      {visibleTabs.length > 0 && (
        <div className="mt-16">
          <div className="flex gap-6 border-b border-border overflow-x-auto">
            {visibleTabs.map((tk) => (
              <button
                key={tk.key}
                onClick={() => setTab(tk.key)}
                className={`-mb-px flex-shrink-0 border-b-2 pb-3 text-sm uppercase tracking-wider ${tab === tk.key ? "border-gold text-foreground" : "border-transparent text-muted-foreground"}`}
              >
                {tk.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === "story" && hasStory && (
              <p className="max-w-2xl text-lg italic leading-relaxed">{tl(product.story)}</p>
            )}
            {tab === "desc" && hasDesc && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{tl(product.description)}</p>
            )}
            {tab === "specs" && hasSpecs && (
              <div className="max-w-md">
                {product.specs!.map((s, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border py-3">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="text-sm font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              <div className="max-w-2xl">
                <Reviews productId={product.id} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* FBT */}
      {fbt.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Frequently Bought Together</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fbt.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">You May Also Like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <aside
        aria-label="Quick actions"
        className={`fixed bottom-14 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl p-3 shadow-2xl transition-all duration-300 sm:hidden ${
          showStickyBar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">{tl(product.name)}</p>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="font-black text-cyan">{formatPrice(product.price)}</span>
              {size && <span className="text-muted-foreground">· {size}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 rounded-lg bg-secondary border border-border px-3.5 py-2.5 text-xs font-mono font-bold text-foreground active:scale-95 transition-transform touch-manipulation"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {addedToCart ? "ADDED" : "ADD"}
            </button>
            <Link
              to="/cart"
              onClick={() => addToCart(product, size, color, qty)}
              className="flex items-center gap-1 rounded-lg bg-foreground px-4 py-2.5 text-xs font-mono font-bold text-background shadow-md active:scale-95 transition-transform touch-manipulation"
            >
              BUY NOW
            </Link>
          </div>
        </div>
      </aside>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </div>
  );
}