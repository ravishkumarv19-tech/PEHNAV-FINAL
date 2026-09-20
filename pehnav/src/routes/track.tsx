import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, MapPin, Clock, Search, Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { supabase, type DBOrder, type DBOrderItem, type DBOrderStatusHistory } from "@/lib/supabase";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order — PEHNAV" }] }),
  component: TrackPage,
});

const STATUS_STEPS = [
  { key: "processing", label: "Order Confirmed", icon: CheckCircle, desc: "We've received and confirmed your order." },
  { key: "packed", label: "Packed", icon: Package, desc: "Your order is packed and ready to ship." },
  { key: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on its way with the courier." },
  { key: "delivered", label: "Delivered", icon: MapPin, desc: "Delivered successfully." },
];

const STATUS_RANK: Record<string, number> = {
  pending: 0,
  processing: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
};

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [order, setOrder] = useState<(DBOrder & { order_items: DBOrderItem[]; order_status_history: DBOrderStatusHistory[] }) | null>(null);

  const performLookup = async (targetQuery: string) => {
    const clean = targetQuery.replace(/^#/, "").trim();
    if (!clean || clean.length < 4) {
      setError("Please enter a valid order number (e.g. PHN-10000) or full email address.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // 1. Try secure RPC tracking lookup first
      const { data: rpcData, error: rpcErr } = await supabase.rpc("track_order", { p_query: clean });
      if (!rpcErr && rpcData && rpcData.id) {
        setOrder(rpcData);
        setLoading(false);
        return;
      }
    } catch {
      // Continue to fallback queries
    }

    try {
      // 2. Direct table queries fallback (matching order_number, tracking_number, email, phone, or id)
      let q = supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(*)");

      if (/^PHN-\d+$/i.test(clean)) {
        q = q.ilike("order_number", clean);
      } else if (/^\d{5,7}$/.test(clean)) {
        q = q.or(`order_number.ilike.PHN-${clean},order_number.ilike.${clean},phone.eq.${clean}`);
      } else if (clean.includes("@")) {
        q = q.ilike("email", clean);
      } else if (/^[0-9a-fA-F-]{8,36}$/.test(clean)) {
        q = q.or(`id.eq.${clean},tracking_number.ilike.${clean},order_number.ilike.${clean}`);
      } else {
        q = q.or(`tracking_number.ilike.${clean},order_number.ilike.${clean}`);
      }

      const { data, error: dbErr } = await q
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbErr || !data) {
        setError("Order not found. Please verify your order number (e.g. PHN-10000), or email address.");
      } else {
        setOrder(data as any);
      }
    } catch {
      setError("Unable to retrieve order details. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) performLookup(query);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const initial = params.get("q") || params.get("order") || params.get("track");
      if (initial) {
        setQuery(initial);
        performLookup(initial);
      }
    }
  }, []);


  const copyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success("Tracking number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const rank = order ? (STATUS_RANK[order.status] ?? 0) : 0;

  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <p className="eyebrow text-gold font-bold">Delivery Status</p>
      <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Track Your Order</h1>
      <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
        Enter your <strong>Order Number</strong> (e.g., <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">PHN-10000</code>), or <strong>Email Address</strong>.
      </p>

      <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. PHN-10000, or your email..."
            className="w-full rounded-lg border border-border/80 bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-background transition-all hover:bg-gold hover:text-white disabled:opacity-60 shadow-sm"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Track Order</span>
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-10 space-y-6 animate-fade-up">
          {/* Header Summary Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Reference</p>
                <h3 className="font-display text-2xl font-bold text-foreground">{order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${order.status === "delivered" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                    order.status === "shipped" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                      order.status === "cancelled" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {order.status}
                </span>
                <p className="text-xs text-muted-foreground">Total: <span className="font-bold text-foreground">{formatPrice(order.total)}</span></p>
              </div>
            </div>

            {/* Courier & Tracking Callout if Shipped */}
            {order.tracking_number && (
              <div className="mt-5 rounded-lg border border-gold/30 bg-gold/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Courier & Tracking Details</p>
                    <p className="text-sm font-semibold text-foreground">
                      {order.courier ? `${order.courier.toUpperCase()} — ` : ""}
                      <span className="font-mono text-gold font-bold">{order.tracking_number}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTracking(order.tracking_number!)}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
                      title="Copy Tracking Number"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    {order.courier?.toLowerCase().includes("speed post") || order.courier?.toLowerCase().includes("india post") ? (
                      <a
                        href="https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                      >
                        <span>Track on India Post</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipment Progress Visualizer */}
          {order.status !== "cancelled" && (
            <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
              <h4 className="font-display text-base font-bold mb-6">Shipment Timeline</h4>
              <div className="relative">
                {/* Background vertical bar */}
                <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-border" />
                {/* Active progress bar */}
                <div
                  className="absolute left-[17px] top-4 w-0.5 bg-gold transition-all duration-700"
                  style={{ height: `${Math.min(100, (rank / (STATUS_STEPS.length - 1)) * 100)}%` }}
                />

                <div className="space-y-7">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= rank;
                    const current = i === rank;
                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${done ? "border-gold bg-gold text-white shadow-xs" : "border-border bg-background text-muted-foreground"
                          }`}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            {current && (
                              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Activity Log / Status Updates */}
          {order.order_status_history && order.order_status_history.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
              <h4 className="font-display text-base font-bold mb-4">Activity Log</h4>
              <div className="divide-y divide-border/60">
                {[...order.order_status_history].reverse().map((h: any) => (
                  <div key={h.id} className="flex items-start gap-3 py-3 text-sm first:pt-0 last:pb-0">
                    <Clock className="h-4 w-4 flex-shrink-0 text-gold mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground capitalize">Status updated to: <span className="text-gold">{h.status}</span></p>
                      {h.note && <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>}
                      <p className="mt-1 text-[11px] text-muted-foreground/75">
                        {new Date(h.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address & Ordered Items in 2-column grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Address */}
            <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
              <h4 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Delivery Address</span>
              </h4>
              <p className="text-sm font-bold text-foreground">{order.shipping_name}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {order.shipping_line1}{order.shipping_line2 ? `, ${order.shipping_line2}` : ""}<br />
                {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
              </p>
              <p className="mt-2 text-xs font-medium text-foreground">Phone: {order.shipping_phone}</p>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
              <h4 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-gold" />
                <span>Ordered Items</span>
              </h4>
              <div className="space-y-3">
                {order.order_items?.map((item: DBOrderItem) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image_url} alt={item.product_name} className="h-12 w-12 rounded-lg object-cover border border-border/80 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">Size: {item.size} · Qty: {item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-gold">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
