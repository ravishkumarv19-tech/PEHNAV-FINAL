import { useEffect, useState, useRef } from "react";
import {
  Search, Filter, Download, Eye, X, Loader2, Package,
  Truck, CheckCircle, XCircle, RefreshCcw, ChevronDown,
  Copy, ExternalLink, Printer,
} from "lucide-react";
import { supabase, type Order, type OrderItem, type OrderStatus } from "@/lib/supabase";
import { useAuth, logAudit } from "@/lib/auth";
import { toast } from "sonner";

const STATUS_ORDER: OrderStatus[] = [
  "pending", "processing", "packed", "shipped", "delivered", "cancelled", "refunded",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "bg-amber-500/15 text-amber-400 border-amber-500/30",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  packed:     "bg-violet-500/15 text-violet-400 border-violet-500/30",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
  refunded:   "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const PAY_COLORS: Record<string, string> = {
  paid:     "bg-emerald-500/15 text-emerald-400",
  pending:  "bg-amber-500/15 text-amber-400",
  failed:   "bg-red-500/15 text-red-400",
  refunded: "bg-gray-500/15 text-gray-400",
};

const PAGE_SIZE = 25;

export default function Orders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [payFilter, setPayFilter] = useState<string>("all");
  const [detail, setDetail] = useState<(Order & { order_items: OrderItem[] }) | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const load = async (p = page) => {
    setLoading(true);
    try {
      let q = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (payFilter !== "all") q = q.eq("payment_status", payFilter);
      if (search.trim()) {
        q = q.or(
          `order_number.ilike.%${search}%,email.ilike.%${search}%,shipping_name.ilike.%${search}%`
        );
      }

      const { data, error, count } = await q;
      if (error) throw error;
      setOrders((data as Order[]) ?? []);
      setTotal(count ?? 0);
    } catch (err: any) {
      toast.error("Failed to load orders: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(0); load(0); }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [search, statusFilter, payFilter]);

  useEffect(() => { load(); }, [page]);

  const openDetail = async (order: Order) => {
    setLoadingDetail(true);
    setDetail({ ...order, order_items: [] });
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    setDetail({ ...order, order_items: (data as OrderItem[]) ?? [] });
    setLoadingDetail(false);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!user || !profile) return;
    setUpdatingStatus(orderId);
    const old = orders.find((o) => o.id === orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) { toast.error("Update failed: " + error.message); setUpdatingStatus(null); return; }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: newStatus,
      note: `Status updated by admin ${profile.email}`,
    });

    await logAudit(user.id, profile.email, "UPDATE_ORDER_STATUS", "orders", orderId,
      { status: old?.status }, { status: newStatus });

    toast.success(`Order updated to "${newStatus}"`);
    setUpdatingStatus(null);

    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (detail?.id === orderId) setDetail((d) => d ? { ...d, status: newStatus } : d);
  };

  const updateTracking = async (orderId: string, tracking: string, courier: string) => {
    if (!user || !profile) return;
    const { error } = await supabase.from("orders").update({
      tracking_number: tracking || null,
      courier: courier || null,
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);
    if (error) { toast.error("Failed: " + error.message); return; }
    await logAudit(user.id, profile.email, "UPDATE_TRACKING", "orders", orderId,
      {}, { tracking_number: tracking, courier });
    toast.success("Tracking info saved");
    setDetail((d) => d ? { ...d, tracking_number: tracking, courier } : d);
  };

  const exportCSV = () => {
    const header = "Order #,Email,Name,Status,Payment,Total,City,State,Date";
    const rows = orders.map((o) =>
      [o.order_number, o.email, o.shipping_name, o.status, o.payment_status,
        o.total, o.shipping_city, o.shipping_state,
        new Date(o.created_at).toLocaleDateString("en-IN")].join(",")
    ).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pehnav-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("CSV exported");
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={`flex gap-4 ${detail ? "items-start" : "flex-col"} pb-12`}>
      {/* ── List ── */}
      <div className={`flex flex-col transition-all duration-200 ${detail ? "w-full lg:w-[55%]" : "w-full"}`}>
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <span className="badge bg-[#2a2d3a] text-gray-400">{total}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order, email, name…" className="input pl-9 w-64" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0); }} className="select w-auto">
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={payFilter} onChange={(e) => { setPayFilter(e.target.value); setPage(0); }} className="select w-auto">
              <option value="all">All payments</option>
              {["paid", "pending", "failed", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={exportCSV} className="btn-ghost gap-1.5"><Download className="h-4 w-4" /> CSV</button>
            <button onClick={() => load()} className="btn-ghost px-2.5"><RefreshCcw className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Table */}
        <div className={`panel overflow-x-auto ${detail ? "max-h-[calc(100vh-140px)] overflow-y-auto" : ""}`}>
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#161920]">
                <tr className="border-b border-[#2a2d3a]">
                  {["Order", "Customer", "Total", "Status", "Payment", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-600">No orders found.</td></tr>
                )}
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => openDetail(o)}
                    className={`table-row cursor-pointer ${detail?.id === o.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gold">{o.order_number ?? o.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-medium">{o.shipping_name}</p>
                      <p className="text-gray-600 text-[10px] truncate max-w-[140px]">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                      ₹{(o.total ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                        disabled={updatingStatus === o.id}
                        className={`rounded-full border px-2 py-1 text-[10px] font-semibold bg-transparent cursor-pointer ${STATUS_COLORS[o.status]}`}
                      >
                        {STATUS_ORDER.map((s) => <option key={s} value={s} className="bg-[#1e2130] text-white">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${PAY_COLORS[o.payment_status] ?? "badge"}`}>{o.payment_status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <Eye className="h-3.5 w-3.5 text-gray-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
            <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-2.5 py-1 rounded text-xs ${page === i ? "bg-gold text-black font-bold" : "text-gray-500 hover:text-white"}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {detail && (
        <div className="w-full lg:w-[45%] sticky top-0 max-h-[calc(100vh-48px)] overflow-y-auto pb-10">
          <div className="panel">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2d3a] bg-[#161920] px-5 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-gold">{detail.order_number ?? detail.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">{new Date(detail.created_at).toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => setDetail(null)} className="rounded-lg p-1.5 hover:bg-[#2a2d3a]">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="space-y-5 p-5">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <select value={detail.status}
                    onChange={(e) => updateStatus(detail.id, e.target.value as OrderStatus)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold bg-transparent ${STATUS_COLORS[detail.status]}`}>
                    {STATUS_ORDER.map((s) => <option key={s} value={s} className="bg-[#1e2130] text-white">{s}</option>)}
                  </select>
                  <span className={`badge ${PAY_COLORS[detail.payment_status] ?? ""}`}>{detail.payment_status}</span>
                </div>

                {/* Customer */}
                <section>
                  <h3 className="eyebrow mb-2">Customer</h3>
                  <div className="rounded-lg bg-[#0f1117] p-3 text-sm space-y-1">
                    <p className="font-medium text-white">{detail.shipping_name}</p>
                    <p className="text-gray-400">{detail.email}</p>
                    <p className="text-gray-400">{detail.phone}</p>
                  </div>
                </section>

                {/* Shipping */}
                <section>
                  <h3 className="eyebrow mb-2">Shipping Address</h3>
                  <div className="rounded-lg bg-[#0f1117] p-3 text-sm text-gray-400 space-y-0.5">
                    <p>{detail.shipping_line1}</p>
                    {detail.shipping_line2 && <p>{detail.shipping_line2}</p>}
                    <p>{detail.shipping_city}, {detail.shipping_state} – {detail.shipping_pincode}</p>
                  </div>
                </section>

                {/* Tracking */}
                <section>
                  <h3 className="eyebrow mb-2">Tracking</h3>
                  <TrackingForm order={detail} onSave={updateTracking} />
                </section>

                {/* Items */}
                <section>
                  <h3 className="eyebrow mb-2">Items ({detail.order_items.length})</h3>
                  <div className="space-y-2">
                    {detail.order_items.map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-lg bg-[#0f1117] p-3">
                        <img src={item.image_url} alt={item.product_name}
                          className="h-12 w-10 rounded-md object-cover border border-[#2a2d3a] flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = ""; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-500">{item.size} · {item.color} · ×{item.qty}</p>
                        </div>
                        <p className="text-sm font-semibold text-white whitespace-nowrap">
                          ₹{(item.total_price ?? 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Totals */}
                <section className="rounded-lg bg-[#0f1117] p-3 text-sm space-y-1.5">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{(detail.subtotal ?? 0).toLocaleString("en-IN")}</span></div>
                  {(detail.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-400"><span>Discount {detail.coupon_code && `(${detail.coupon_code})`}</span><span>−₹{detail.discount.toLocaleString("en-IN")}</span></div>
                  )}
                  <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{(detail.shipping_fee ?? 0) === 0 ? "Free" : `₹${detail.shipping_fee}`}</span></div>
                  <div className="flex justify-between border-t border-[#2a2d3a] pt-1.5 font-bold text-white">
                    <span>Total</span><span>₹{(detail.total ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                </section>

                {/* Payment IDs */}
                {detail.razorpay_order_id && (
                  <section>
                    <h3 className="eyebrow mb-2">Payment</h3>
                    <div className="space-y-1.5 text-xs">
                      <CopyRow label="Razorpay Order" value={detail.razorpay_order_id} />
                      {detail.razorpay_payment_id && <CopyRow label="Payment ID" value={detail.razorpay_payment_id} />}
                    </div>
                  </section>
                )}

                {/* Notes */}
                <section>
                  <h3 className="eyebrow mb-2">Internal Notes</h3>
                  <NotesField order={detail} onSave={async (notes) => {
                    await supabase.from("orders").update({ notes }).eq("id", detail.id);
                    setDetail((d) => d ? { ...d, notes } : d);
                    toast.success("Notes saved");
                  }} />
                </section>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-[#0f1117] px-3 py-2">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="font-mono text-gray-300 truncate">{value}</span>
      <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}
        className="text-gray-600 hover:text-gold flex-shrink-0">
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function TrackingForm({ order, onSave }: {
  order: Order;
  onSave: (id: string, tracking: string, courier: string) => void;
}) {
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [courier, setCourier] = useState(order.courier ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={courier} onChange={(e) => setCourier(e.target.value)}
          placeholder="Courier (e.g. Delhivery)" className="input text-xs" />
        <input value={tracking} onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking number" className="input text-xs" />
      </div>
      <button onClick={async () => { setSaving(true); await onSave(order.id, tracking, courier); setSaving(false); }}
        disabled={saving} className="btn-ghost text-xs px-3 py-1.5 w-full justify-center">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Tracking"}
      </button>
    </div>
  );
}

function NotesField({ order, onSave }: { order: Order; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(order.notes ?? "");
  return (
    <div className="space-y-2">
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
        rows={3} placeholder="Internal notes visible only to admins…" className="input resize-none text-xs" />
      <button onClick={() => onSave(notes)} className="btn-ghost text-xs px-3 py-1.5 w-full justify-center">
        Save Notes
      </button>
    </div>
  );
}
