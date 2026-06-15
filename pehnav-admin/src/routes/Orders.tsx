import { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, Loader2, ExternalLink, X } from "lucide-react";
import { supabase, type Order, type OrderItem } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/auth";
import { toast } from "sonner";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const STATUSES = ["pending","processing","packed","shipped","delivered","cancelled","refunded"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  packed: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  shipped: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  refunded: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

export default function Orders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<(Order & { order_items: OrderItem[] }) | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tracking, setTracking] = useState({ number: "", courier: "" });

  const load = async () => {
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    const { data } = await q;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = orders.filter((o) =>
    !search ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    o.shipping_name.toLowerCase().includes(search.toLowerCase())
  );

  const openOrder = async (o: Order) => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", o.id)
      .single();
    setSelected(data as any);
    setTracking({ number: data?.tracking_number ?? "", courier: data?.courier ?? "" });
  };

  const updateStatus = async (newStatus: string) => {
    if (!selected || !user || !profile) return;
    setUpdatingStatus(true);
    const old = selected.status;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", selected.id);

    if (error) { toast.error("Failed to update status"); setUpdatingStatus(false); return; }

    // Log status change to history
    await supabase.from("order_status_history").insert({
      order_id: selected.id,
      status: newStatus,
      note: `Status changed from ${old} to ${newStatus} by admin ${profile.email}`,
    });

    // Audit log
    await logAudit(user.id, profile.email, "UPDATE_ORDER_STATUS", "orders", selected.id,
      { status: old }, { status: newStatus });

    toast.success(`Order ${selected.order_number} → ${newStatus}`);
    setSelected((p) => p ? { ...p, status: newStatus as any } : p);
    setUpdatingStatus(false);
    load();
  };

  const saveTracking = async () => {
    if (!selected || !user || !profile) return;
    const { error } = await supabase
      .from("orders")
      .update({ tracking_number: tracking.number || null, courier: tracking.courier || null })
      .eq("id", selected.id);

    if (error) { toast.error("Failed to save"); return; }

    await logAudit(user.id, profile.email, "UPDATE_TRACKING", "orders", selected.id,
      { tracking_number: selected.tracking_number, courier: selected.courier },
      { tracking_number: tracking.number, courier: tracking.courier });

    toast.success("Tracking saved");
    setSelected((p) => p ? { ...p, tracking_number: tracking.number, courier: tracking.courier } : p);
    load();
  };

  return (
    <div className="flex h-full gap-0">
      {/* List */}
      <div className={`flex flex-col ${selected ? "w-[55%]" : "w-full"} transition-all`}>
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <span className="rounded-full bg-[#2a2d3a] px-2.5 py-0.5 text-xs text-gray-400">{filtered.length}</span>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order, name, email…" className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-auto">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2d3a]">
                  {["Order", "Customer", "Date", "Total", "Status", "Payment"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No orders found</td></tr>
                )}
                {filtered.map((o) => (
                  <tr key={o.id} onClick={() => openOrder(o)}
                    className={`table-row cursor-pointer ${selected?.id === o.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gold">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{o.shipping_name}</p>
                      <p className="text-xs text-gray-500">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{fmt(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${STATUS_COLORS[o.status]} capitalize`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${o.payment_status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"} capitalize`}>
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="ml-4 w-[45%] overflow-y-auto">
          <div className="panel">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2a2d3a] px-5 py-4">
              <div>
                <p className="font-mono text-sm text-gold">{selected.order_number}</p>
                <p className="text-xs text-gray-500">{new Date(selected.created_at).toLocaleString("en-IN")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 hover:bg-[#2a2d3a]">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Status update */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={updatingStatus || selected.status === s}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                        selected.status === s
                          ? `${STATUS_COLORS[s]} cursor-default`
                          : "border-[#2a2d3a] text-gray-400 hover:border-gold hover:text-gold"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Tracking</p>
                <div className="space-y-2">
                  <input value={tracking.courier} onChange={(e) => setTracking((p) => ({ ...p, courier: e.target.value }))}
                    placeholder="Courier (e.g. Shiprocket, DTDC)" className="input" />
                  <input value={tracking.number} onChange={(e) => setTracking((p) => ({ ...p, number: e.target.value }))}
                    placeholder="Tracking number" className="input" />
                  <button onClick={saveTracking} className="btn-primary text-xs">Save Tracking</button>
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</p>
                <div className="rounded-lg bg-[#0f1117] p-3 text-sm space-y-1">
                  <p className="font-medium text-white">{selected.shipping_name}</p>
                  <p className="text-gray-400">{selected.email}</p>
                  <p className="text-gray-400">{selected.phone}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Shipping Address</p>
                <div className="rounded-lg bg-[#0f1117] p-3 text-sm text-gray-300 space-y-0.5">
                  <p>{selected.shipping_line1}</p>
                  <p>{selected.shipping_city}, {selected.shipping_state} — {selected.shipping_pincode}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Items</p>
                <div className="space-y-2">
                  {selected.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg bg-[#0f1117] p-3">
                      <img src={item.image_url} alt={item.product_name} className="h-12 w-10 rounded-md object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.size} · {item.color} · ×{item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">{fmt(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-[#0f1117] p-3 text-sm space-y-1.5">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(selected.subtotal)}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>− {fmt(selected.discount)}</span></div>}
                <div className="flex justify-between text-gray-400"><span>Shipping</span><span>{selected.shipping_fee === 0 ? "Free" : fmt(selected.shipping_fee)}</span></div>
                <div className="flex justify-between font-bold text-white border-t border-[#2a2d3a] pt-1.5"><span>Total</span><span>{fmt(selected.total)}</span></div>
              </div>

              {selected.razorpay_payment_id && (
                <p className="text-xs text-gray-600 font-mono">Razorpay: {selected.razorpay_payment_id}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
