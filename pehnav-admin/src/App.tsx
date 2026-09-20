import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Login from "@/components/Login";
import Dashboard from "@/routes/Dashboard";
import Products from "@/routes/Products";
import Orders from "@/routes/Orders";
import Customers from "@/routes/Customers";
import Coupons from "@/routes/Coupons";
import Reviews from "@/routes/Reviews";
import AuditLog from "@/routes/AuditLog";

function Layout() {
  const { user, profile, loading, signOut } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#BFA16A] border-t-transparent" />
        <p className="text-sm text-gray-500">Authenticating…</p>
      </div>
    </div>
  );
  if (!user || !profile) return <Login />;
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      <Sidebar onSignOut={signOut} />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
        <Toaster position="bottom-right" toastOptions={{ style: { background: "#1e2130", border: "1px solid #2a2d3a", color: "#f0f0f0", fontSize: "13px" } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
