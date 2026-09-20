import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  RotateCcw,
  RefreshCw,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Search,
  Loader2,
  Calendar,
  Clock,
  HelpCircle,
  Sparkles,
  Printer,
  ChevronRight,
} from "lucide-react";
import { supabase, type Order, type OrderItem } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges Portal — PEHNAV" },
      {
        name: "description",
        content:
          "Hassle-free 7-day returns and instant exchanges. Self-service portal with free doorstep pickup.",
      },
    ],
  }),
  component: ReturnsPage,
});

const REASONS = [
  "Size is too small",
  "Size is too large",
  "Fit/Silhouette not as expected",
  "Color differs from photos",
  "Defective or damaged piece",
  "Received incorrect item",
  "Changed my mind",
];

const FAQS = [
  {
    q: "What is PEHNAV's return & exchange policy window?",
    a: "We offer a 7-day hassle-free return and exchange policy from the date your order is delivered. Items must be unworn, unwashed, and in their original packaging with all brand tags intact.",
  },
  {
    q: "Is return shipping free?",
    a: "Yes! Your first exchange or return per order is 100% FREE. Our logistics partner will arrive at your doorstep with a tamper-proof return bag to collect the package.",
  },
  {
    q: "How fast is an exchange processed?",
    a: "Once you submit an exchange request, your replacement size/color is instantly reserved in our warehouse. The new item is dispatched as soon as the courier scans the pickup at your door.",
  },
  {
    q: "When will I receive my refund?",
    a: "Refunds to your original payment method (Credit/Debit Card, UPI, NetBanking) are processed within 24–48 hours after the returned piece passes quality inspection at our studio. Store credit refunds are credited instantly.",
  },
  {
    q: "Can I exchange an item for a different product altogether?",
    a: "Yes! You can choose store credit (which includes a +10% bonus credit) and use it immediately to purchase any other piece from our collections.",
  },
];

export default function ReturnsPage() {
  const [orderQuery, setOrderQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Return/Exchange Request State
  const [selectedItems, setSelectedItems] = useState<Record<string, {
    action: "exchange" | "return";
    reason: string;
    targetSize?: string;
    resolution: "source" | "store_credit";
  }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{
    requestId: string;
    pickupDate: string;
    itemsCount: number;
    actionType: string;
  } | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) {
      toast.error("Please enter your Order Number (e.g. PHN-10002)");
      return;
    }

    setSearching(true);
    setErrorMsg("");
    setOrder(null);
    setOrderItems([]);
    setSelectedItems({});
    setSubmittedRequest(null);

    try {
      const q = orderQuery.trim().toUpperCase();
      let query = supabase.from("orders").select("*");

      if (q.startsWith("PHN-")) {
        query = query.eq("order_number", q);
      } else {
        query = query.or(`order_number.eq.${q},id.eq.${q}`);
      }

      if (emailQuery.trim()) {
        query = query.ilike("email", `%${emailQuery.trim()}%`);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) {
        setErrorMsg(`No order found matching "${q}"${emailQuery ? ` and email "${emailQuery}"` : ""}. Please verify your order confirmation email.`);
        setSearching(false);
        return;
      }

      setOrder(data as Order);

      // Fetch order items
      const { data: items, error: itemError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", data.id);

      if (itemError) throw itemError;
      setOrderItems((items as OrderItem[]) ?? []);
      toast.success(`Order ${data.order_number ?? data.id.slice(0, 8)} found!`);
    } catch (err: any) {
      setErrorMsg("Failed to fetch order: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const toggleItemSelection = (item: OrderItem) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[item.id]) {
        delete copy[item.id];
      } else {
        copy[item.id] = {
          action: "exchange",
          reason: REASONS[0],
          targetSize: item.size === "M" ? "L" : "M",
          resolution: "store_credit",
        };
      }
      return copy;
    });
  };

  const updateItemConfig = (itemId: string, field: string, val: any) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: val,
      },
    }));
  };

  const handleSubmitRequest = async () => {
    const itemIds = Object.keys(selectedItems);
    if (itemIds.length === 0) {
      toast.error("Please select at least one item to return or exchange.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));

    const reqId = `RET-${Math.floor(10000 + Math.random() * 90000)}`;
    const pickup = new Date(Date.now() + 86400000 * 2).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isExchange = Object.values(selectedItems).some((x) => x.action === "exchange");

    setSubmittedRequest({
      requestId: reqId,
      pickupDate: pickup,
      itemsCount: itemIds.length,
      actionType: isExchange ? "Exchange & Replacement" : "Return & Refund",
    });
    setSubmitting(false);
    toast.success(`Return request ${reqId} generated successfully!`);
  };

  return (
    <div className="bg-background text-foreground pb-20">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0d0f14] py-16 sm:py-24 border-b border-border/40">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>7-Day Effortless Policy</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Returns & Exchanges <br />
              <span className="text-gold">Zero Hassle. Instant Resolution.</span>
            </h1>
            <p className="mt-4 text-base text-gray-300 leading-relaxed max-w-2xl">
              Didn't love the fit? Need a different size? We've made exchanges and returns completely friction-free. Start your self-service request below in under 60 seconds.
            </p>
          </div>
        </div>
      </section>

      {/* ── Self Service Lookup & Form ── */}
      <section className="py-12">
        <div className="mx-auto max-w-[1100px] px-6">
          {!submittedRequest ? (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl">
              <div className="border-b border-border/60 pb-6 mb-8">
                <p className="eyebrow text-gold font-bold">Step 1</p>
                <h2 className="font-display text-2xl font-bold mt-1">Look Up Your Order</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your PEHNAV order number (found in your confirmation email or order history).
                </p>
              </div>

              <form onSubmit={handleLookup} className="grid gap-4 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <label className="label">Order Number *</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      placeholder="e.g. PHN-10002"
                      className="input pl-9 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    placeholder="name@domain.com"
                    className="input"
                  />
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={searching}
                    className="btn-primary w-full justify-center h-[42px]"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4" /> Search
                      </>
                    )}
                  </button>
                </div>
              </form>

              {errorMsg && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Order Results & Item Selector */}
              {order && orderItems.length > 0 && (
                <div className="mt-10 border-t border-border/80 pt-8 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary/40 p-4 border border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Order Identified</p>
                      <p className="font-mono text-base font-bold text-gold">
                        {order.order_number ?? order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Placed On</p>
                      <p className="text-xs font-semibold">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className="badge bg-emerald-500/15 text-emerald-400 uppercase font-bold text-[10px]">
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recipient</p>
                      <p className="text-xs font-semibold">{order.shipping_name}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <p className="eyebrow text-gold font-bold">Step 2</p>
                    <h3 className="font-display text-xl font-bold mt-1">
                      Select Items to Return or Exchange
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose which pieces you would like to swap for another size/color or return for a refund.
                    </p>

                    <div className="mt-6 space-y-4">
                      {orderItems.map((item) => {
                        const isSelected = !!selectedItems[item.id];
                        const cfg = selectedItems[item.id];

                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl border transition-all p-5 ${
                              isSelected
                                ? "border-gold bg-gold/5 shadow-md"
                                : "border-border bg-background hover:border-border/90"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleItemSelection(item)}
                                  className="h-5 w-5 accent-gold cursor-pointer rounded"
                                />
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="h-14 w-12 rounded-lg object-cover border border-border flex-shrink-0 bg-secondary"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                                <div>
                                  <p className="font-semibold text-sm">{item.product_name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Size: <span className="font-bold text-foreground">{item.size}</span> | Qty: {item.qty} | ₹{item.unit_price?.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>

                              <span className="font-mono text-sm font-bold text-gold">
                                ₹{(item.total_price ?? item.unit_price * item.qty).toLocaleString("en-IN")}
                              </span>
                            </div>

                            {/* Options if selected */}
                            {isSelected && (
                              <div className="mt-5 border-t border-border/60 pt-4 grid gap-4 sm:grid-cols-3 animate-fade-in text-xs">
                                <div>
                                  <label className="label">Requested Action</label>
                                  <select
                                    value={cfg.action}
                                    onChange={(e) =>
                                      updateItemConfig(item.id, "action", e.target.value)
                                    }
                                    className="select text-xs"
                                  >
                                    <option value="exchange">Exchange for Different Size</option>
                                    <option value="return">Return for Refund</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="label">Reason</label>
                                  <select
                                    value={cfg.reason}
                                    onChange={(e) =>
                                      updateItemConfig(item.id, "reason", e.target.value)
                                    }
                                    className="select text-xs"
                                  >
                                    {REASONS.map((r) => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {cfg.action === "exchange" ? (
                                  <div>
                                    <label className="label">Exchange Size</label>
                                    <select
                                      value={cfg.targetSize}
                                      onChange={(e) =>
                                        updateItemConfig(item.id, "targetSize", e.target.value)
                                      }
                                      className="select text-xs"
                                    >
                                      {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                                        <option key={s} value={s}>
                                          Size {s} {s === item.size ? "(Current)" : ""}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="label">Refund Mode</label>
                                    <select
                                      value={cfg.resolution}
                                      onChange={(e) =>
                                        updateItemConfig(item.id, "resolution", e.target.value)
                                      }
                                      className="select text-xs"
                                    >
                                      <option value="store_credit">Store Credit (+10% Bonus)</option>
                                      <option value="source">Original Payment Method</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 3: Confirmation & Submit */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
                      <div className="text-xs text-muted-foreground text-center sm:text-left">
                        <span>Pickup from registered address: </span>
                        <span className="font-semibold text-foreground">
                          {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                        </span>
                      </div>

                      <button
                        onClick={handleSubmitRequest}
                        disabled={submitting || Object.keys(selectedItems).length === 0}
                        className="btn-primary px-8 py-3 w-full sm:w-auto justify-center"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                          </>
                        ) : (
                          <>
                            Submit Request ({Object.keys(selectedItems).length} items) →
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Success Confirmation Card ── */
            <div className="rounded-3xl border border-emerald-500/40 bg-card p-8 sm:p-12 shadow-2xl animate-fade-up text-center max-w-2xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Request Authorized!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your return/exchange slip has been scheduled. Keep the original tags attached for the courier agent.
              </p>

              <div className="mt-8 rounded-2xl bg-secondary/50 p-6 text-left border border-border space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Return Request ID:</span>
                  <span className="font-mono font-bold text-gold text-sm">{submittedRequest.requestId}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold text-foreground">{submittedRequest.actionType}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Estimated Doorstep Pickup:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gold" /> {submittedRequest.pickupDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Courier:</span>
                  <span className="font-semibold text-foreground">BlueDart / Delhivery Express</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="btn-ghost gap-2 justify-center"
                >
                  <Printer className="h-4 w-4" /> Print Return Slip
                </button>
                <Link
                  to="/track"
                  className="btn-primary gap-2 justify-center"
                >
                  Track Status →
                </Link>
                <button
                  onClick={() => {
                    setSubmittedRequest(null);
                    setOrder(null);
                    setOrderItems([]);
                  }}
                  className="btn-ghost text-xs"
                >
                  Start Another
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4-Step Process Guide ── */}
      <section className="py-16 bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-gold font-bold">How It Works</p>
            <h2 className="mt-2 font-display text-3xl font-bold">4 Easy Steps to Complete</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've eliminated complicated return paperwork. Here's what happens next.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: Package,
                title: "1. Request Online",
                desc: "Enter your order ID above, select the piece, and choose your preferred size or refund mode in 60 seconds.",
              },
              {
                step: "02",
                icon: Truck,
                title: "2. Free Doorstep Pickup",
                desc: "Our courier arrives within 24–48 hours with a sealed tamper-proof bag. No return label printing needed.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "3. Swift Quality Check",
                desc: "Inspected at our Mumbai atelier within 24 hours of receipt to verify original tags and unworn condition.",
              },
              {
                step: "04",
                icon: RefreshCw,
                title: "4. Instant Dispatch / Refund",
                desc: "Your replacement is dispatched immediately, or your full refund is credited to your bank / UPI.",
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="rounded-2xl border border-border bg-card p-6 relative transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-gold/30">{st.step}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">{st.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Policy Eligibility Checklist ── */}
      <section className="py-16">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-4">
                <CheckCircle2 className="h-5 w-5" />
                <span>Eligible for Full Return or Free Exchange</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Initiated within 7 days from verified delivery date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Unworn, unwashed, unaltered with original brand tags attached</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Footwear in original shoe box with protective dust covers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Items with manufacturing defects or incorrect sizing delivery</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-8">
              <div className="flex items-center gap-2 text-red-400 font-bold text-base mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>Non-Returnable Items</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Garments with removed or torn hangtags or perfume/laundry scents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Custom monogrammed or personalized pieces</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Final clearance archivals explicitly marked "Non-Returnable"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <span>Requests made after the 7-day delivery window has expired</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Return FAQs ── */}
      <section className="py-16 border-t border-border bg-card/40">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">Return & Exchange FAQs</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Clear answers to the most common questions regarding returns and refunds.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm hover:text-gold transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-gold font-mono text-lg">{openFaq === idx ? "−" : "+"}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center rounded-2xl bg-secondary/40 p-6 border border-border">
            <p className="text-sm font-semibold">Still need assistance with an exchange?</p>
            <p className="text-xs text-muted-foreground mt-1">Our concierge team is available 10:00 AM – 7:00 PM IST.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Link to="/contact" className="btn-ghost text-xs">
                Contact Concierge →
              </Link>
              <a href="mailto:orders@pehnav.store" className="btn-primary text-xs">
                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
