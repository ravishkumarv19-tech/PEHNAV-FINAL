import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Truck, CheckCircle, MapPin, Clock, Search, Loader2 } from "lucide-react";
import { supabase, type DBOrder, type DBOrderItem, type DBOrderStatusHistory } from "@/lib/supabase";
import { formatPrice } from "@/lib/data";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order — PEHNAV" }] }),
  component: TrackPage,
});

const STATUS_STEPS = [
  { key: "processing", label: "Order Confirmed", icon: CheckCircle, desc: "We've received and confirmed your order." },
  { key: "packed", label: "Packed", icon: Package, desc: "Your order is packed and ready to ship." },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on its way!" },
  { key: "delivered", label: "Delivered", icon: MapPin, desc: "Delivered successfully." },
];

const STATUS_RANK: Record<string, number> = {
  pending: 0, processing: 1, packed: 2, shipped: 3, delivered: 4,
};

function TrackPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<(DBOrder & { order_items: DBOrderItem[]; order_status_history: DBOrderStatusHistory[] }) | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = query.trim();
    if (!raw) return;
    setLoading(true);
    setError("");
    setOrder(null);

    // Sanitize input — strip anything that isn't alphanumeric, @, ., or -
    const sanitized = raw.replace(/[^a-zA-Z0-9@.\-_]/g, "");
    if (!sanitized) { setError("Invalid input"); setLoading(false); return; }

    // Determine if it's an order number or email — never pass raw to .or()
    const isOrderNumber = /^PHN-\d+$/i.test(sanitized);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized);

    if (!isOrderNumber && !isEmail) {
      setError("Enter a valid order number (e.g. PHN-10001) or email address.");
      setLoading(false);
      return;
    }

    let q = supabase
      .from("orders")
      .select("*, order_items(*), order_status_history(*)");

    if (isOrderNumber) {
      q = q.eq("order_number", sanitized.toUpperCase());
    } else {
      q = q.eq("email", sanitized.toLowerCase());
    }

    const { data, error: dbErr } = await q
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (dbErr || !data) {
      setError("Order not found. Check the order number or email.");
    } else {
      setOrder(data as any);
    }
    setLoading(false);
  };

  const rank = order ? (STATUS_RANK[order.status] ?? 0) : 0;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Track Your Order</h1>
      <p className="mt-2 text-muted-foreground text-sm">Enter your order number (e.g. PHN-10001) or email address.</p>

      <form onSubmit={search} className="mt-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Order number or email"
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <button disabled={loading} className="flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm uppercase tracking-wider text-background disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      {order && (
        <div className="mt-10 space-y-8">
          {/* Header */}
          <div className="rounded-md border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
                <p className="text-lg font-bold">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold">{formatPrice(order.total)}</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  order.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                  order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                  order.status === "cancelled" ? "bg-red-50 text-red-700" :
                  "bg-amber-50 text-amber-700"
                }`}>{order.status}</span>
              </div>
            </div>
          </div>

          {/* Tracking timeline */}
          {order.status !== "cancelled" && (
            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold mb-6">Shipment Progress</h2>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-[18px] top-0 h-full w-0.5 bg-border" />
                <div
                  className="absolute left-[18px] top-0 w-0.5 bg-gold transition-all duration-700"
                  style={{ height: `${Math.min(100, (rank / (STATUS_STEPS.length - 1)) * 100)}%` }}
                />

                <div className="space-y-8">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= rank;
                    const current = i === rank;
                    return (
                      <div key={step.key} className="relative flex gap-5">
                        <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          done ? "border-gold bg-gold text-background" : "border-border bg-background text-muted-foreground"
                        }`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                            {current && <span className="ml-2 text-xs font-normal text-gold">Current</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                          {step.key === "shipped" && order.tracking_number && done && (
                            <p className="mt-1 text-xs font-medium text-gold">
                              {order.courier} · {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Status history */}
          {order.order_status_history?.length > 0 && (
            <div className="rounded-md border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold mb-4">Activity Log</h2>
              <div className="space-y-3">
                {[...order.order_status_history].reverse().map((h: any) => (
                  <div key={h.id} className="flex gap-3 text-sm">
                    <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium capitalize">{h.status}</p>
                      {h.note && <p className="text-muted-foreground">{h.note}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(h.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping address */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold mb-3">Delivering to</h2>
            <p className="text-sm font-medium">{order.shipping_name}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p>
            <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
          </div>

          {/* Items */}
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold mb-4">Items</h2>
            <div className="space-y-3">
              {order.order_items.map((item: DBOrderItem) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image_url} alt={item.product_name} className="h-16 w-16 rounded-md object-cover border border-border flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.size} · {item.color} · ×{item.qty}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
