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
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <h1 className="font-display text-4xl font-bold">{t("cart.title")}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {cart.map((item, idx) => (
            <div
              key={item.id}
              className="flex gap-4 py-5 animate-stagger-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Link to="/products/$id" params={{ id: item.product.id }} className="h-28 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                <img src={item.product.image} alt={tl(item.product.name)} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{tl(item.product.name)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.size} · <span className="inline-block h-3 w-3 translate-y-0.5 rounded-full border" style={{ backgroundColor: item.color }} /></p>
                  </div>
                  <button onClick={() => { removeToast(tl(item.product.name)); removeFromCart(item.id); }} aria-label="Remove" className="transition-transform hover:scale-110 hover:text-destructive"><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                    <span className="w-7 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="font-semibold">{formatPrice(item.product.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Order Summary</h2>
          <div className="mt-4 flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={t("cart.coupon")} className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
            <button onClick={applyCoupon} className="rounded-md bg-foreground px-4 text-sm text-background">{t("cart.apply")}</button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground"><Tag className="mr-1 inline h-3 w-3" />Try code PEHNAV10 for 10% off</p>
          <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.subtotal")}</dt><dd>{formatPrice(cartTotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-gold"><dt>Discount</dt><dd>-{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("cart.shipping")}</dt><dd>{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>{t("cart.total")}</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <Link to="/checkout" className="mt-5 block rounded-md bg-foreground py-3.5 text-center text-sm font-medium uppercase tracking-wider text-background transition-transform hover:-translate-y-0.5">{t("cart.checkout")}</Link>
        </aside>
      </div>
    </div>
  );
}
