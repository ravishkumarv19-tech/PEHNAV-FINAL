import { Link } from "@tanstack/react-router";
import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import { useState, useRef } from "react";
import type { Product } from "@/lib/data";
import { formatPrice, IMAGES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/Toast";

const badgeLabel: Record<string, string> = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
};

const badgeClass: Record<string, string> = {
  new: "bg-foreground text-background",
  bestseller: "bg-cyan text-black font-black",
  limited: "bg-red-600 text-white font-black",
};

interface ColorSwatchProps {
  colors: string[];
  customColors?: { hex: string; name: string }[];
  selected: string;
  onSelect: (c: string) => void;
}

function ColorSwatches({ colors, customColors, selected, onSelect }: ColorSwatchProps) {
  const getName = (hex: string) => customColors?.find((c) => c.hex === hex)?.name ?? hex;
  if (colors.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {colors.slice(0, 5).map((c, i) => (
        <button
          key={c}
          title={getName(c)}
          onClick={(e) => { e.preventDefault(); onSelect(c); }}
          style={{ backgroundColor: c, animationDelay: `${i * 40}ms` }}
          className={`swatch-enter h-4 w-4 sm:h-3.5 sm:w-3.5 rounded-full border-[1.5px] transition-all duration-200 touch-manipulation ${selected === c ? "border-foreground scale-125 ring-1 ring-cyan" : "border-transparent hover:border-foreground/40 hover:scale-110 active:scale-95"}`}
        />
      ))}
      {colors.length > 5 && <span className="self-center text-[10px] text-muted-foreground font-mono">+{colors.length - 5}</span>}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { tl } = useI18n();
  const { toggleWishlist, inWishlist, addToCart } = useStore();
  const { cartToast, wishlistToast } = useToast();
  const saved = inWishlist(product.id);

  const [heartKey, setHeartKey] = useState(0);
  const [flyActive, setFlyActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [showSizePicker, setShowSizePicker] = useState(false);
  const flyRef = useRef<HTMLDivElement>(null);

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const hasSecondImg = gallery.length > 1;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = !saved;
    toggleWishlist(product.id);
    setHeartKey((k) => k + 1);
    wishlistToast(tl(product.name), nowSaved);
  };

  const executeAddToCart = (sizeToAdd: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sizeToAdd);
    addToCart(product, sizeToAdd, selectedColor, 1);
    cartToast(`${tl(product.name)} (${sizeToAdd})`, product.image);
    setQuickAdded(true);
    setShowSizePicker(false);
    setTimeout(() => setQuickAdded(false), 1800);

    if (flyRef.current) {
      const btn = flyRef.current.getBoundingClientRect();
      const cartEl = document.querySelector("[data-cart-icon]");
      if (cartEl) {
        const cart = cartEl.getBoundingClientRect();
        flyRef.current.style.setProperty("--fly-x", `${cart.left + cart.width / 2 - btn.left - btn.width / 2}px`);
        flyRef.current.style.setProperty("--fly-y", `${cart.top + cart.height / 2 - btn.top - btn.height / 2}px`);
        setFlyActive(true);
        setTimeout(() => setFlyActive(false), 700);
      }
    }
  };

  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  return (
    <div
      className="group product-card-container relative flex flex-col grid-item-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSizePicker(false); }}
    >
      {/* Image container */}
      <div className="product-card-img-wrap relative aspect-[4/5] overflow-hidden rounded-xl bg-card shadow-sm">
        <Link to="/products/$id" params={{ id: product.id }} className="block h-full w-full">
          {/* Main image with silky smooth subtle zoom */}
          <img
            src={product.image || gallery[0] || IMAGES.placeholder}
            alt={tl(product.name)}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = IMAGES.placeholder; }}
            style={{ viewTransitionName: `product-image-${product.id}` } as React.CSSProperties}
            className="product-card-img absolute inset-0 h-full w-full object-cover filter brightness-[0.96] contrast-[1.03]"
          />
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className={`rounded-md px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${badgeClass[product.badge] ?? "bg-foreground text-background"}`}>
              {badgeLabel[product.badge]}
            </span>
          )}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="pointer-events-none absolute right-12 top-3 z-10 rounded-md border border-border/50 bg-background/90 px-2 py-0.5 text-[9px] font-mono font-bold text-foreground backdrop-blur-md shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[4px] z-20">
            <span className="rounded-md border border-border bg-background px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Quick actions bar */}
        {product.inStock && (
          <div className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ${hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
            {showSizePicker ? (
              <div className="glass-modern p-2.5 border-t border-border flex flex-col gap-1.5 animate-step-slide-in">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-1">
                  <span>SELECT SIZE</span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(false); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => executeAddToCart(s, e)}
                      className={`h-8 rounded-md text-xs font-mono font-bold transition-all spring-click ${selectedSize === s ? "bg-cyan text-black shadow-sm font-black" : "bg-background/90 text-foreground hover:bg-foreground hover:text-background border border-border"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex border-t border-border/40 shadow-lg">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (product.sizes.length > 1) {
                      setShowSizePicker(true);
                    } else {
                      executeAddToCart(product.sizes[0] ?? "M", e);
                    }
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 py-3 text-[11px] font-mono font-bold uppercase tracking-widest backdrop-blur-md transition-all spring-click ${quickAdded ? "bg-cyan text-black" : "bg-foreground/95 text-background hover:bg-cyan hover:text-black"}`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {quickAdded ? "ADDED TO BAG" : product.sizes.length > 1 ? "QUICK ADD [SIZE]" : "QUICK ADD"}
                </button>
                <Link
                  to="/products/$id"
                  params={{ id: product.id }}
                  className="flex w-11 items-center justify-center bg-background/90 text-foreground backdrop-blur-md transition-colors hover:bg-background hover:text-cyan border-l border-border/40 spring-click"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          key={heartKey}
          onClick={handleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-2 top-2 sm:right-2.5 sm:top-2.5 z-20 flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-sm transition-all active:scale-90 sm:hover:scale-110 sm:hover:bg-background spring-click touch-manipulation ${heartKey > 0 ? "animate-heart-pop" : ""}`}
        >
          <Heart className={`h-4 w-4 sm:h-3.5 sm:w-3.5 transition-all duration-200 ${saved ? "fill-cyan text-cyan scale-110" : "text-foreground"}`} />
        </button>

        {/* Fly particle */}
        <div
          ref={flyRef}
          className={`pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 ${flyActive ? "animate-fly-to-cart" : "hidden"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan shadow-xl text-black">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3.5 space-y-1.5 px-0.5">
        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="py-0.5">
            <ColorSwatches
              colors={product.colors}
              customColors={product.customColors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>
        )}

        <Link to="/products/$id" params={{ id: product.id }} className="group/title block">
          <h3 className="text-sm font-bold leading-tight text-foreground transition-colors group-hover/title:text-cyan">
            {tl(product.name)}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tight">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs font-mono text-muted-foreground line-through decoration-muted-foreground/60">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <Star className="h-3 w-3 fill-cyan text-cyan" />
            <span>{product.rating}</span>
            <span className="text-muted-foreground/50">({product.reviews ?? product.reviewCount ?? 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
