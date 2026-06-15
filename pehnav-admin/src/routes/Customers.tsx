import { useEffect, useState } from "react";
import { Search, Loader2, User, ShoppingBag, TrendingUp } from "lucide-react";
import { supabase, type Profile } from "@/lib/supabase";

interface CustomerRow extends Profile {
  order_count: number;
  total_spend: number;
  last_order_at: string | null;
}

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    // Get all customers
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (!profiles) { setLoading(false); return; }

    // Get order aggregates per user
    const { data: orderAgg } = await supabase
      .from("orders")
      .select("user_id, total, created_at")
      .eq("payment_status", "paid");

    const agg: Record<string, { count: number; total: number; last: string }> = {};
    (orderAgg ?? []).forEach((o: any) => {
      if (!o.user_id) return;
      if (!agg[o.user_id]) agg[o.user_id] = { count: 0, total: 0, last: o.created_at };
      agg[o.user_id].count += 1;
      agg[o.user_id].total += o.total;
      if (o.created_at > agg[o.user_id].last) agg[o.user_id].last = o.created_at;
    });

    setCustomers(
      profiles.map((p: any) => ({
        ...p,
        order_count: agg[p.id]?.count ?? 0,
        total_spend: agg[p.id]?.total ?? 0,
        last_order_at: agg[p.id]?.last ?? null,
      }))
    );
    setLoading(false);
  }

  const filtered = customers.filter((c) =>
    !search ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <span className="rounded-full bg-[#2a2d3a] px-2.5 py-0.5 text-xs text-gray-400">{filtered.length}</span>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-gray-500">Total Customers</p>
            <p className="text-lg font-bold text-white">{customers.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg font-bold text-gold">
              {fmt(customers.reduce((s, c) => s + c.total_spend, 0))}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input pl-9 max-w-md" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                {["Customer", "Phone", "Joined", "Orders", "Total Spent", "Last Order"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No customers found.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2a2d3a] flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-300">
                          {(c.full_name ?? c.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{c.full_name ?? "—"}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.order_count > 0 ? "bg-blue-500/15 text-blue-400" : "bg-gray-500/15 text-gray-500"}`}>
                      {c.order_count} order{c.order_count !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gold">
                    {c.total_spend > 0 ? fmt(c.total_spend) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.last_order_at
                      ? new Date(c.last_order_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
