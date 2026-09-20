import { useEffect, useState, useRef } from "react";
import { Search, Eye, X, ShoppingBag, Loader2, Ban, CheckCircle, Mail } from "lucide-react";
import { supabase, type Profile, type Order } from "@/lib/supabase";
import { useAuth, logAudit } from "@/lib/auth";
import { toast } from "sonner";

const PAGE_SIZE = 25;

export default function Customers() {
  const { user, profile } = useAuth();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<{ customer: Profile; orders: Order[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const load = async (p = page) => {
    setLoading(true);
    try {
      let q = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

      if (search.trim()) {
        q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      setCustomers((data as Profile[]) ?? []);
      setTotal(count ?? 0);
    } catch (err: any) {
      toast.error("Failed to load customers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setPage(0); load(0); }, 350);
    return () => clearTimeout(searchRef.current);
  }, [search]);

  useEffect(() => { load(); }, [page]);

  const openDetail = async (c: Profile) => {
    setLoadingDetail(true);
    setDetail({ customer: c, orders: [] });
    const { data } = await supabase
      .from("orders")
      .select("id,order_number,total,status,payment_status,created_at")
      .eq("email", c.email)
      .order("created_at", { ascending: false })
      .limit(20);
    setDetail({ customer: c, orders: (data as Order[]) ?? [] });
    setLoadingDetail(false);
  };

  const banCustomer = async (c: Profile) => {
    if (!user || !profile) return;
    const isBanned = c.role === "banned" as any;
    const newRole = isBanned ? "customer" : "banned";
    const msg = isBanned
      ? `Unban ${c.email}?`
      : `Ban ${c.email}? They will be unable to sign in.`;
    if (!confirm(msg)) return;

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", c.id);
    if (error) { toast.error("Failed: " + error.message); return; }
    await logAudit(user.id, profile.email, isBanned ? "UNBAN_CUSTOMER" : "BAN_CUSTOMER",
      "profiles", c.id, { role: c.role }, { role: newRole });
    toast.success(isBanned ? `${c.email} unbanned` : `${c.email} banned`);
    load();
    if (detail?.customer.id === c.id) {
      setDetail((d) => d ? { ...d, customer: { ...d.customer, role: newRole as any } } : d);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400",
    processing: "bg-blue-500/15 text-blue-400",
    shipped: "bg-cyan-500/15 text-cyan-400",
    delivered: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-red-500/15 text-red-400",
  };

  return (
    <div className={`flex gap-4 ${detail ? "items-start" : "flex-col"} pb-12`}>
      {/* ── List ── */}
      <div className={`flex flex-col transition-all ${detail ? "w-full lg:w-[55%]" : "w-full"}`}>
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <span className="badge bg-[#2a2d3a] text-gray-400">{total}</span>
          <div className="ml-auto relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name…" className="input pl-9 w-64" />
          </div>
        </div>

        <div className={`panel overflow-x-auto ${detail ? "max-h-[calc(100vh-140px)] overflow-y-auto" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#161920]">
                <tr className="border-b border-[#2a2d3a]">
                  {["Customer", "Phone", "Role", "Joined", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-16 text-center text-gray-600">No customers found.</td></tr>
                )}
                {customers.map((c) => (
                  <tr key={c.id} onClick={() => openDetail(c)}
                    className={`table-row cursor-pointer ${detail?.customer.id === c.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2d3a] text-xs font-bold text-gray-300">
                          {(c.full_name ?? c.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{c.full_name ?? "—"}</p>
                          <p className="text-[10px] text-gray-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        c.role === "admin" ? "bg-gold/15 text-gold" :
                        (c.role as string) === "banned" ? "bg-red-500/15 text-red-400" :
                        "bg-[#2a2d3a] text-gray-400"}`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
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
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`px-2.5 py-1 rounded text-xs ${page === i ? "bg-gold text-black font-bold" : "text-gray-500 hover:text-white"}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {detail && (
        <div className="w-full lg:w-[45%] sticky top-0 max-h-[calc(100vh-48px)] overflow-y-auto pb-10">
          <div className="panel">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2d3a] bg-[#161920] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2d3a] text-sm font-bold text-gray-300">
                  {(detail.customer.full_name ?? detail.customer.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{detail.customer.full_name ?? "Anonymous"}</p>
                  <p className="text-[10px] text-gray-500">{detail.customer.email}</p>
                </div>
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
                {/* Info */}
                <div className="rounded-lg bg-[#0f1117] p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{detail.customer.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="text-white">{detail.customer.phone ?? "—"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Role</span>
                    <span className={`badge ${detail.customer.role === "admin" ? "bg-gold/15 text-gold" : (detail.customer.role as string) === "banned" ? "bg-red-500/15 text-red-400" : "bg-[#2a2d3a] text-gray-400"}`}>
                      {detail.customer.role}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-gray-500">Joined</span>
                    <span className="text-white">{new Date(detail.customer.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Orders", value: detail.orders.length },
                    { label: "Paid", value: detail.orders.filter((o) => o.payment_status === "paid").length },
                    { label: "Total Spent", value: `₹${detail.orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + (o.total ?? 0), 0).toLocaleString("en-IN")}` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-[#0f1117] p-3">
                      <p className="text-lg font-bold text-white">{s.value}</p>
                      <p className="text-[10px] text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Order history */}
                <section>
                  <h3 className="eyebrow mb-2">Order History</h3>
                  {detail.orders.length === 0 ? (
                    <p className="text-sm text-gray-600">No orders yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between rounded-lg bg-[#0f1117] px-3 py-2.5">
                          <div>
                            <p className="font-mono text-xs font-semibold text-gold">{o.order_number ?? o.id.slice(0, 8)}</p>
                            <p className="text-[10px] text-gray-600">{new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${STATUS_COLORS[o.status] ?? "bg-[#2a2d3a] text-gray-400"}`}>{o.status}</span>
                            <span className="text-sm font-semibold text-white">₹{(o.total ?? 0).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a href={`mailto:${detail.customer.email}`}
                    className="btn-ghost flex-1 justify-center gap-2 text-xs">
                    <Mail className="h-3.5 w-3.5" /> Email Customer
                  </a>
                  {detail.customer.role !== "admin" && (
                    <button onClick={() => banCustomer(detail.customer)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                        (detail.customer.role as string) === "banned"
                          ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      }`}>
                      {(detail.customer.role as string) === "banned"
                        ? <><CheckCircle className="h-3.5 w-3.5" /> Unban</>
                        : <><Ban className="h-3.5 w-3.5" /> Ban Customer</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // defined inside component to access STATUS_COLORS
  function notUsed() {}
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  processing: "bg-blue-500/15 text-blue-400",
  packed: "bg-violet-500/15 text-violet-400",
  shipped: "bg-cyan-500/15 text-cyan-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-gray-500/15 text-gray-400",
};
