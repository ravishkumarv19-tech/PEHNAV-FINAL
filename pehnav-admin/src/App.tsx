import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/components/Login";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/routes/Dashboard";
import Orders from "@/routes/Orders";
import Products from "@/routes/Products";
import Customers from "@/routes/Customers";
import Reviews from "@/routes/Reviews";
import Coupons from "@/routes/Coupons";
import AuditLog from "@/routes/AuditLog";
import { Loader2 } from "lucide-react";

function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0c12]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c12]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/orders"    element={<Orders />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reviews"   element={<Reviews />} />
          <Route path="/coupons"   element={<Coupons />} />
          <Route path="/audit"     element={<AuditLog />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" desc="Advanced revenue analytics — coming soon." />} />
          <Route path="/blog"      element={<PlaceholderPage title="Blog" desc="Blog post management — coming soon." />} />
          <Route path="/settings"  element={<PlaceholderPage title="Settings" desc="Store settings — coming soon." />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function PlaceholderPage({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
      <p className="text-gray-500 text-sm">{desc ?? "Coming soon."}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminLayout />
        <Toaster
          theme="dark"
          toastOptions={{
            style: { background: "#161920", border: "1px solid #2a2d3a", color: "#e8e8e8" },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
