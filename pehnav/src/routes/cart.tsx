import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, X, Tag, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/data";
import { useToast } from "@/components/Toast";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — PEHNAV" }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal } = useStore();
  const { t, tl } = useI18n();
  const { removeToast, couponToast, errorToast } = useToast();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "PEHNAV10") {
      const amount = Math.round(cartTotal * 0.1);
      setDiscount(amount);
      couponToast("PEHNAV10", "10%");
    } else {
      setDiscount(0);
      errorToast("Invalid coupon", "That code doesn't exist or has expired.");
    }
  };

  const shipping = cartTotal > 1499 || cartTotal === 0 ? 0 : 99;
  const total = cartTotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center animate-fade-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold">{t("cart.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("cart.empty")}</p>
        <Link to="/shop" className="mt-6 inline-block rounded-md bg-foreground px-8 py-3 text-sm uppercase tracking-wider text-background transition-transform hover:-translate-y-0.5">{t("cta.shop")}</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-12 pb-32 sm:pb-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold">{t("cart.title")}</h1>
      <div className="mt-6 sm:mt-8 grid gap-8 lg:gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {cart.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-3 sm:gap-4 py-4 sm:py-5 animate-stagger-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Link to="/products/$id" params={{ id: item.product.id }} className="h-24 w-20 sm:h-28 sm:w-24 shrink-0 overflow-hidden rounded-md bg-secondary border border-border">
                <img src={item.product.image} alt={tl(item.product.name)} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-1">
                    <h3 className="font-medium text-sm sm:text-base leading-snug line-clamp-1">{tl(item.product.name)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <span>{item.size}</span>
                      <span>·</span>
                      <span className="inline-block h-3 w-3 rounded-full border border-border" style={{ backgroundColor: item.color }} />
                    </p>
                  </div>
                  <button
                    onClick={() => { removeToast(tl(item.product.name)); removeFromCart(item.id); }}
                    aria-label="Remove"
                    className="p-2 -mr-2 min-h-[40px] min-w-[40px] flex items-center justify-center transition-transform active:scale-90 hover:scale-110 hover:text-destructive touch-manipulation"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-md border border-border bg-card">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="p-2.5 sm:p-2 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-secondary active:scale-90 transition-transform touch-manipulation"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs sm:text-sm font-mono font-bold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="p-2.5 sm:p-2 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-secondary active:scale-90 transition-transform touch-manipulation"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-mono font-bold text-sm sm:text-base">{formatPrice(item.product.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder={t("cart.coupon")}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-cyan"
            />
            <button
              onClick={applyCoupon}
              className="rounded-md bg-foreground px-4 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-background active:scale-95 transition-transform"
            >
              {t("cart.apply")}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground"><Tag className="mr-1 inline h-3 w-3 text-cyan" />Try code PEHNAV10 for 10% off</p>
          <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm font-mono">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.subtotal")}</dt><dd className="font-medium text-foreground">{formatPrice(cartTotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-cyan"><dt>Discount</dt><dd>-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.shipping")}</dt><dd className="font-medium text-foreground">{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground"><dt>{t("cart.total")}</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <Link
            to="/checkout"
            className="mt-6 hidden sm:block rounded-md bg-foreground py-3.5 text-center text-xs font-mono font-bold uppercase tracking-wider text-background transition-transform hover:-translate-y-0.5"
          >
            {t("cart.checkout")}
          </Link>
        </aside>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <aside
        aria-label="Checkout actions"
        className="fixed bottom-14 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl p-3 shadow-2xl sm:hidden"
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t("cart.total")}</p>
            <p className="text-base font-black text-foreground">{formatPrice(total)}</p>
          </div>
          <Link
            to="/checkout"
            className="flex-1 max-w-[200px] rounded-lg bg-foreground py-3 text-center text-xs font-mono font-bold uppercase tracking-wider text-background shadow-md active:scale-95 transition-transform"
          >
            {t("cart.checkout")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
