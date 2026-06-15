import { useEffect, useState } from "react";
import {
  ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase, type Order } from "@/lib/supabase";

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface Stats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  pendingOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  recentOrders: Order[];
  topProducts: { name: string; qty: number; revenue: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  processing: "bg-blue-500/15 text-blue-400",
  packed: "bg-purple-500/15 text-purple-400",
  shipped: "bg-cyan-500/15 text-cyan-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
  refunded: "bg-gray-500/15 text-gray-400",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: thisMonthOrders },
      { data: lastMonthOrders },
      { data: allCustomers },
      { data: newCustomers },
      { data: recentOrders },
      { data: orderItems },
      { data: pendingData },
    ] = await Promise.all([
      supabase.from("orders").select("total, created_at, status").gte("created_at", thisMonthStart).eq("payment_status", "paid"),
      supabase.from("orders").select("total").gte("created_at", lastMonthStart).lt("created_at", thisMonthStart).eq("payment_status", "paid"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "customer"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "customer").gte("created_at", thisMonthStart),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("order_items").select("product_name, qty, total_price").gte("created_at", last30),
      supabase.from("orders").select("id", { count: "exact" }).in("status", ["pending", "processing"]),
    ]);

    const thisRev = (thisMonthOrders ?? []).reduce((s: number, o: any) => s + o.total, 0);
    const lastRev = (lastMonthOrders ?? []).reduce((s: number, o: any) => s + o.total, 0);
    const revChange = lastRev > 0 ? ((thisRev - lastRev) / lastRev) * 100 : 100;

    // Revenue by day (last 14 days)
    const dayMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      dayMap[key] = 0;
    }
    (thisMonthOrders ?? []).forEach((o: any) => {
      const key = new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (key in dayMap) dayMap[key] += o.total;
    });
    const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue }));

    // Top products
    const prodMap: Record<string, { qty: number; revenue: number }> = {};
    (orderItems ?? []).forEach((i: any) => {
      if (!prodMap[i.product_name]) prodMap[i.product_name] = { qty: 0, revenue: 0 };
      prodMap[i.product_name].qty += i.qty;
      prodMap[i.product_name].revenue += i.total_price;
    });
    const topProducts = Object.entries(prodMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setStats({
      totalRevenue: thisRev,
      revenueChange: revChange,
      totalOrders: thisMonthOrders?.length ?? 0,
      ordersChange: 0,
      totalCustomers: allCustomers?.length ?? 0,
      customersChange: newCustomers?.length ?? 0,
      pendingOrders: pendingData?.length ?? 0,
      revenueByDay,
      recentOrders: (recentOrders as Order[]) ?? [],
      topProducts,
    });
    setLoading(false);
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );

  const s = stats!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue (this month)",
            value: fmt(s.totalRevenue),
            change: s.revenueChange,
            icon: TrendingUp,
            color: "text-emerald-400",
          },
          {
            label: "Orders (this month)",
            value: s.totalOrders.toString(),
            change: 0,
            icon: ShoppingCart,
            color: "text-blue-400",
          },
          {
            label: "Total Customers",
            value: s.totalCustomers.toString(),
            change: s.customersChange,
            icon: Users,
            color: "text-purple-400",
          },
          {
            label: "Pending Orders",
            value: s.pendingOrders.toString(),
            change: 0,
            icon: Clock,
            color: "text-yellow-400",
          },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
            {card.change !== 0 && (
              <div className={`mt-1 flex items-center gap-1 text-xs ${card.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {card.change > 0
                  ? <ArrowUpRight className="h-3 w-3" />
                  : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(card.change).toFixed(1)}% vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="panel p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Revenue — Last 14 Days</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s.revenueByDay} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BFA16A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#BFA16A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#161920", border: "1px solid #2a2d3a", borderRadius: 8, color: "#e8e8e8", fontSize: 12 }}
                formatter={(v: number) => [fmt(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#BFA16A" strokeWidth={2} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <div className="panel">
          <div className="flex items-center justify-between border-b border-[#2a2d3a] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <a href="/orders" className="text-xs text-gold hover:underline">View all</a>
          </div>
          <div className="divide-y divide-[#2a2d3a]">
            {s.recentOrders.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500">No orders yet.</p>
            )}
            {s.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{o.order_number}</p>
                  <p className="text-xs text-gray-500">{o.shipping_name} · {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_COLORS[o.status] ?? "bg-gray-500/15 text-gray-400"} capitalize`}>
                    {o.status}
                  </span>
                  <span className="text-sm font-semibold text-white">{fmt(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="panel">
          <div className="flex items-center justify-between border-b border-[#2a2d3a] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Top Products (30 days)</h2>
            <Package className="h-4 w-4 text-gray-500" />
          </div>
          <div className="divide-y divide-[#2a2d3a]">
            {s.topProducts.length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-500">No sales data yet.</p>
            )}
            {s.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-mono text-gray-600 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.qty} units sold</p>
                </div>
                <p className="text-sm font-semibold text-gold">{fmt(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
