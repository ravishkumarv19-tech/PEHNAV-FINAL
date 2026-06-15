import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Heart, Minus, Plus, Star, Truck, RefreshCw, Shield, ChevronDown, ShoppingBag, Check } from "lucide-react";
import { getProduct, products, formatPrice } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import Reviews from "@/components/Reviews";
import StyleAssistant from "@/components/StyleAssistant";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name.en} — PEHNAV` },
          { name: "description", content: loaderData.product.description.en },
          { property: "og:title", content: `${loaderData.product.name.en} — PEHNAV` },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-gold underline">Back to shop</Link>
    </div>
  ),
  errorComponent: () => <div className="px-6 py-32 text-center">Something went wrong.</div>,
  component: PDP,
});

const tabs = ["story", "desc", "specs", "reviews"] as const;

function PDP() {
  const { product } = Route.useLoaderData();
  const { t, tl } = useI18n();
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const { cartToast, wishlistToast } = useToast();

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof tabs)[number]>("story");
  const [addedToCart, setAddedToCart] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = () => {
    addToCart(product, size, color, qty);
    cartToast(tl(product.name), product.image);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    const nowSaved = !inWishlist(product.id);
    toggleWishlist(product.id);
    setHeartKey((k) => k + 1);
    wishlistToast(tl(product.name), nowSaved);
  };

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fbt = products.filter((p) => p.id !== product.id).slice(0, 2);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {product.gallery.map((g: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`h-20 w-16 overflow-hidden rounded-md border animate-stagger-up transition-all duration-200 ${activeImg === i ? "border-foreground scale-105 shadow-md" : "border-border hover:border-foreground/50"}`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="group relative flex-1 overflow-hidden rounded-md bg-secondary">
            <img src={product.gallery[activeImg]} alt={tl(product.name)} className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-125" />
          </div>
        </div>

        {/* details */}
        <div>
          <p className="eyebrow text-gold">{product.collection}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{tl(product.name)}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" /> {product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} {t("pdp.reviews")})</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>}
            {product.compareAt && <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold">{Math.round((1 - product.price / product.compareAt) * 100)}% OFF</span>}
          </div>

          <div className="mt-6">
            <p className="eyebrow mb-2">{t("pdp.color")}</p>
            <div className="flex gap-3">
              {product.colors.map((c: string) => (
                <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`h-8 w-8 rounded-full border ${color === c ? "ring-2 ring-gold ring-offset-2" : "border-border"}`} aria-label={c} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">{t("pdp.size")}</p>
              <span className="text-xs text-muted-foreground underline">Size Guide</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s: string) => (
                <button key={s} onClick={() => setSize(s)} className={`min-w-11 rounded-md border px-3 py-2 text-sm ${size === s ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 transition-colors hover:bg-secondary" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 transition-colors hover:bg-secondary" aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              key={heartKey}
              onClick={handleWishlist}
              className={`flex h-12 w-12 items-center justify-center rounded-md border border-border transition-colors hover:bg-secondary ${heartKey > 0 ? "animate-heart-pop" : ""}`}
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 transition-colors duration-200 ${inWishlist(product.id) ? "fill-gold text-gold" : ""}`} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              ref={addBtnRef}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md border py-4 text-sm font-medium uppercase tracking-wider transition-all duration-300 ${addedToCart ? "border-gold bg-gold/10 text-gold" : "border-foreground hover:bg-foreground hover:text-background"}`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4 animate-scale-in" />
                  Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {t("cta.addCart")}
                </>
              )}
            </button>
            <Link
              to="/cart"
              onClick={() => addToCart(product, size, color, qty)}
              className="flex-1 rounded-md bg-foreground py-4 text-center text-sm font-medium uppercase tracking-wider text-background transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              {t("cta.buyNow")}
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1"><Truck className="h-5 w-5 text-gold" /> Free Shipping</div>
            <div className="flex flex-col items-center gap-1"><RefreshCw className="h-5 w-5 text-gold" /> 7-Day Returns</div>
            <div className="flex flex-col items-center gap-1"><Shield className="h-5 w-5 text-gold" /> Secure Payment</div>
          </div>

          {/* AI Style Assistant — inline on PDP */}
          <div className="mt-6">
            <StyleAssistant product={product} trigger="inline" />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-16">
        <div className="flex gap-6 border-b border-border">
          {tabs.map((tk) => (
            <button key={tk} onClick={() => setTab(tk)} className={`-mb-px border-b-2 pb-3 text-sm uppercase tracking-wider ${tab === tk ? "border-gold text-foreground" : "border-transparent text-muted-foreground"}`}>
              {t(`pdp.${tk}` as never)}
            </button>
          ))}
        </div>
        <div className="py-6 text-sm leading-relaxed text-muted-foreground">
          {tab === "story" && <p className="max-w-2xl text-lg italic text-foreground">{tl(product.story)}</p>}
          {tab === "desc" && <p className="max-w-2xl">{tl(product.description)}</p>}
          {tab === "specs" && (
            <ul className="max-w-md space-y-2">
              <li className="flex justify-between border-b border-border py-2"><span>Material</span><span className="text-foreground">Premium Cotton</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>Fit</span><span className="text-foreground">Oversized / Relaxed</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>Care</span><span className="text-foreground">Machine wash cold</span></li>
              <li className="flex justify-between border-b border-border py-2"><span>Origin</span><span className="text-foreground">Made in India</span></li>
            </ul>
          )}
          {tab === "reviews" && (
            <div className="max-w-2xl">
              <Reviews productId={product.id} />
            </div>
          )}
        </div>
      </div>

      {/* FBT */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Frequently Bought Together</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {fbt.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* related */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">{t("pdp.related")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
