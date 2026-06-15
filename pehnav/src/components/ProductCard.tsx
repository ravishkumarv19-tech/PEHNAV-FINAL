import { Link } from "@tanstack/react-router";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useState, useRef } from "react";
import type { Product } from "@/lib/data";
import { formatPrice } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

const badgeLabel: Record<string, { en: string; hi: string }> = {
  new: { en: "New", hi: "नया" },
  bestseller: { en: "Bestseller", hi: "बेस्टसेलर" },
  limited: { en: "Limited", hi: "लिमिटेड" },
};

export default function ProductCard({ product }: { product: Product }) {
  const { tl } = useI18n();
  const { toggleWishlist, inWishlist, addToCart } = useStore();
  const { cartToast, wishlistToast } = useToast();
  const saved = inWishlist(product.id);

  const [heartKey, setHeartKey] = useState(0);
  const [flyActive, setFlyActive] = useState(false);
  const flyRef = useRef<HTMLDivElement>(null);

  const handleWishlist = () => {
    const nowSaved = !saved;
    toggleWishlist(product.id);
    setHeartKey((k) => k + 1);
    wishlistToast(tl(product.name), nowSaved);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.sizes[1] ?? product.sizes[0], product.colors[0], 1);
    cartToast(tl(product.name), product.image);

    // Fly particle toward cart icon
    if (flyRef.current) {
      const btn = flyRef.current.getBoundingClientRect();
      const cartEl = document.querySelector("[data-cart-icon]");
      if (cartEl) {
        const cart = cartEl.getBoundingClientRect();
        const flyX = cart.left + cart.width / 2 - btn.left - btn.width / 2;
        const flyY = cart.top + cart.height / 2 - btn.top - btn.height / 2;
        flyRef.current.style.setProperty("--fly-x", `${flyX}px`);
        flyRef.current.style.setProperty("--fly-y", `${flyY}px`);
        setFlyActive(true);
        setTimeout(() => setFlyActive(false), 700);
      }
    }
  };

  return (
    <div className="group relative">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-secondary">
          <img
            src={product.image}
            alt={tl(product.name)}
            loading="lazy"
            width={800}
            height={1000}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-background">
              {tl(badgeLabel[product.badge])}
            </span>
          )}

          {/* Quick-add button — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
            <button
              onClick={handleQuickAdd}
              className="relative w-full bg-foreground/90 py-3 text-xs font-medium uppercase tracking-wider text-background backdrop-blur hover:bg-foreground"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag className="h-3.5 w-3.5" />
                Quick Add
              </span>
            </button>
          </div>

          {/* Fly particle */}
          <div
            ref={flyRef}
            className={`pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 ${flyActive ? "animate-fly-to-cart" : "hidden"}`}
          >
            <ShoppingBag className="h-5 w-5 text-gold" />
          </div>
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        key={heartKey}
        onClick={handleWishlist}
        aria-label="Wishlist"
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background ${heartKey > 0 ? "animate-heart-pop" : ""}`}
      >
        <Heart className={`h-4 w-4 transition-colors duration-200 ${saved ? "fill-gold text-gold" : "text-foreground"}`} />
      </button>

      <div className="mt-3 space-y-1">
        <Link to="/products/$id" params={{ id: product.id }}>
          <h3 className="text-sm font-medium transition-colors hover:text-gold">{tl(product.name)}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-gold text-gold" />
          {product.rating} · {product.reviews}
        </div>
      </div>
    </div>
  );
}
