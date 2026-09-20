import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  ShoppingBag, Users, TrendingUp, Clock, Package,
  ArrowUpRight, ArrowDownRight, RefreshCcw, AlertCircle,
} from "lucide-react";
import { supabase, type Order } from "@/lib/supabase";
import { toast } from "sonner";

interface DashStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  pendingOrders: number;
  avgOrderValue: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  recentOrders: Order[];
  lowStock: { id: string; name_en: string; stock: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  processing: "#3B82F6",
  packed: "#8B5CF6",
  shipped: "#06B6D4",
  delivered: "#10B981",
  cancelled: "#EF4444",
  refunded: "#6B7280",
};

const PIE_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#EF4444"];

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function pct(change: number) {
  const up = change >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const load = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - range);
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - range);

      const [
        { data: orders },
        { data: prevOrders },
        { count: totalCustomers },
        { count: prevCustomers },
        { data: allProducts },
        { data: recentOrders },
      ] = await Promise.all([
        supabase.from("orders").select("id,total,status,payment_status,created_at")
          .gte("created_at", from.toISOString()),
        supabase.from("orders").select("id,total,payment_status")
          .gte("created_at", prevFrom.toISOString())
          .lt("created_at", from.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true })
          .gte("created_at", from.toISOString()),
        supabase.from("profiles").select("*", { count: "exact", head: true })
          .gte("created_at", prevFrom.toISOString())
          .lt("created_at", from.toISOString()),
        supabase.from("products").select("id,name_en,stock,in_stock"),
        supabase.from("orders")
          .select("id,order_number,email,total,status,payment_status,created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const paidOrders = (orders ?? []).filter((o) => o.payment_status === "paid");
      const prevPaidOrders = (prevOrders ?? []).filter((o) => o.payment_status === "paid");

      const totalRevenue = paidOrders.reduce((s, o) => s + (o.total ?? 0), 0);
      const prevRevenue = prevPaidOrders.reduce((s, o) => s + (o.total ?? 0), 0);
      const revenueChange = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;

      const totalOrders = orders?.length ?? 0;
      const ordersChange = (prevOrders?.length ?? 0) === 0 ? 100
        : ((totalOrders - (prevOrders?.length ?? 0)) / (prevOrders?.length ?? 1)) * 100;

      const custChange = (prevCustomers ?? 0) === 0 ? 100
        : (((totalCustomers ?? 0) - (prevCustomers ?? 0)) / (prevCustomers ?? 1)) * 100;

      const pendingOrders = (orders ?? []).filter((o) => o.status === "pending").length;
      const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;

      // Revenue by day
      const dayMap: Record<string, number> = {};
      for (let i = Math.min(range, 30) - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      paidOrders.forEach((o) => {
        const day = o.created_at?.slice(0, 10);
        if (day && dayMap[day] !== undefined) dayMap[day] += o.total ?? 0;
      });
      const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({
        date: date.slice(5),
        revenue: Math.round(revenue),
      }));

      // Orders by status
      const statusMap: Record<string, number> = {};
      (orders ?? []).forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] ?? 0) + 1;
      });
      const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // Top products from order_items via join
      const { data: itemData } = await supabase
        .from("order_items")
        .select("product_name,qty,total_price,order:orders!inner(payment_status,created_at)")
        .gte("orders.created_at", from.toISOString());

      const prodMap: Record<string, { qty: number; revenue: number }> = {};
      (itemData ?? []).forEach((item: any) => {
        if (item.order?.payment_status !== "paid") return;
        const key = item.product_name;
        if (!prodMap[key]) prodMap[key] = { qty: 0, revenue: 0 };
        prodMap[key].qty += item.qty ?? 0;
        prodMap[key].revenue += item.total_price ?? 0;
      });
      const topProducts = Object.entries(prodMap)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Low stock
      const lowStock = (allProducts ?? [])
        .filter((p) => p.in_stock && p.stock <= 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6);

      setStats({
        totalRevenue, revenueChange,
        totalOrders, ordersChange,
        totalCustomers: totalCustomers ?? 0,
        customersChange: custChange,
        pendingOrders, avgOrderValue,
        revenueByDay, ordersByStatus, topProducts,
        recentOrders: (recentOrders ?? []) as Order[],
        lowStock,
      });
    } catch (err: any) {
      toast.error("Dashboard load failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [range]);

  const statCards = stats ? [
    { label: "Revenue", value: fmt(stats.totalRevenue), change: stats.revenueChange, icon: TrendingUp, color: "text-gold" },
    { label: "Orders", value: stats.totalOrders.toString(), change: stats.ordersChange, icon: ShoppingBag, color: "text-blue-400" },
    { label: "New Customers", value: stats.totalCustomers.toString(), change: stats.customersChange, icon: Users, color: "text-purple-400" },
    { label: "Avg Order", value: fmt(stats.avgOrderValue), change: null, icon: Package, color: "text-emerald-400" },
    { label: "Pending", value: stats.pendingOrders.toString(), change: null, icon: Clock, color: "text-amber-400" },
  ] : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-500">Last {range} days</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30, 90] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${range === r ? "bg-gold text-black" : "bg-[#2a2d3a] text-gray-400 hover:text-white"}`}>
              {r}d
            </button>
          ))}
          <button onClick={load} className="ml-1 rounded-lg p-2 text-gray-500 hover:bg-[#2a2d3a] hover:text-white">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <div key={s.label} className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{s.value}</p>
            {s.change !== null && (
              <div className="mt-1 flex items-center gap-1">
                {pct(s.change)}
                <span className="text-[10px] text-gray-600">vs prev {range}d</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {stats && stats.revenueByDay.length > 0 && (
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
              <Tooltip
                contentStyle={{ background: "#1e2130", border: "1px solid #2a2d3a", borderRadius: 8 }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(v: number) => [fmt(v), "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#BFA16A" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#BFA16A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Orders by Status Pie */}
        {stats && stats.ordersByStatus.length > 0 && (
          <div className="panel p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">Orders by Status</h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={stats.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={65} innerRadius={40}>
                  {stats.ordersByStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid #2a2d3a", borderRadius: 8 }}
                  formatter={(v: number, name: string) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.ordersByStatus.map((s, i) => (
                <span key={s.status} className="flex items-center gap-1 text-[10px] text-gray-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] ?? PIE_COLORS[i % PIE_COLORS.length] }} />
                  {s.status} ({s.count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Products */}
        {stats && (
          <div className="panel p-5 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold text-white">Top Products (by Revenue)</h2>
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-gray-600">No paid orders yet in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.topProducts} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => fmt(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} width={120} />
                  <Tooltip
                    contentStyle={{ background: "#1e2130", border: "1px solid #2a2d3a", borderRadius: 8 }}
                    formatter={(v: number) => [fmt(v), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#BFA16A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        {stats && (
          <div className="panel overflow-hidden">
            <div className="border-b border-[#2a2d3a] px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#1e2130]">
                {stats.recentOrders.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-gray-600">No orders yet</td></tr>
                ) : stats.recentOrders.map((o) => (
                  <tr key={o.id} className="table-row">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs text-gold">{o.order_number ?? o.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">₹{(o.total ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className="badge" style={{ backgroundColor: (STATUS_COLORS[o.status] ?? "#6b7280") + "22", color: STATUS_COLORS[o.status] ?? "#9ca3af" }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Low Stock Alert */}
        {stats && (
          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#2a2d3a] px-5 py-3">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Low Stock Alert</h2>
            </div>
            {stats.lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-600">All products are well-stocked.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#1e2130]">
                  {stats.lowStock.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-white truncate max-w-[180px]">{p.name_en}</p>
                        <p className="font-mono text-[10px] text-gray-600">{p.id}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`badge ${p.stock <= 3 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                          {p.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
