import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ShieldAlert, Package, ShoppingBag, Users, Tag, RefreshCcw, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — PEHNAV" }] }),
  component: Admin,
});

interface Stats {
  orders: number;
  revenue: number;
  customers: number;
  pending: number;
  products: number;
  coupons: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    email: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setFetching(true);
    setError(null);
    try {
      const [ordersRes, profilesRes, productsRes, couponsRes, recentRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, payment_status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("coupons").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, order_number, email, total, status, payment_status, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const orders = ordersRes.data ?? [];
      const revenue = orders
        .filter((o) => o.payment_status === "paid")
        .reduce((s: number, o: any) => s + (o.total ?? 0), 0);
      const pending = orders.filter((o: any) => o.status === "pending").length;

      setStats({
        orders: orders.length,
        revenue,
        customers: profilesRes.count ?? 0,
        pending,
        products: productsRes.count ?? 0,
        coupons: couponsRes.count ?? 0,
        recentOrders: recentRes.data ?? [],
      });
    } catch (e: any) {
      setError("Failed to load dashboard data. Check Supabase connection.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <h1 className="font-display text-2xl font-bold">Access Denied</h1>
        <p className="text-sm text-muted-foreground">You need admin privileges to access this page.</p>
        <Link to="/" className="text-gold underline text-sm">Go home</Link>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as <strong>{user.email}</strong></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={fetching}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity"
          >
            Supabase <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Orders", value: stats?.orders ?? "—", icon: ShoppingBag, color: "text-blue-600" },
          { label: "Revenue", value: stats ? formatPrice(stats.revenue) : "—", icon: Tag, color: "text-emerald-600" },
          { label: "Customers", value: stats?.customers ?? "—", icon: Users, color: "text-purple-600" },
          { label: "Pending", value: stats?.pending ?? "—", icon: ShoppingBag, color: "text-amber-600" },
          { label: "Products", value: stats?.products ?? "—", icon: Package, color: "text-gold" },
          { label: "Coupons", value: stats?.coupons ?? "—", icon: Tag, color: "text-pink-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{fetching ? <span className="opacity-30">—</span> : s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">Recent Orders</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  {["Order #", "Email", "Total", "Payment", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gold">{o.order_number ?? o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{o.email}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.payment_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[o.status] ?? "bg-secondary text-foreground"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {fetching ? "Loading orders…" : "No orders yet. Run the schema.sql in Supabase to set up your database."}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">Full CRUD management is available in the separate Admin Panel app (port 4000).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Manage Orders", desc: "View, update status, export", href: "http://localhost:4000" },
            { label: "Manage Products", desc: "Add, edit, set stock levels", href: "http://localhost:4000" },
            { label: "Manage Coupons", desc: "Create and toggle discount codes", href: "http://localhost:4000" },
            { label: "View Customers", desc: "Browse and manage accounts", href: "http://localhost:4000" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-md border border-border bg-card p-5 hover:border-gold transition-colors group"
            >
              <span className="text-sm font-semibold group-hover:text-gold transition-colors">{l.label}</span>
              <span className="text-xs text-muted-foreground">{l.desc}</span>
              <span className="mt-2 text-[10px] text-gold opacity-0 group-hover:opacity-100 transition-opacity">Open Admin Panel →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
