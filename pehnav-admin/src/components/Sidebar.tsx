import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Star, Ticket, FileText, BarChart3, Settings,
  LogOut, ExternalLink, Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { group: "Overview", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ]},
  { group: "Catalog", items: [
    { to: "/products", label: "Products", icon: Package },
  ]},
  { group: "Sales", items: [
    { to: "/orders", label: "Orders", icon: ShoppingCart },
    { to: "/coupons", label: "Coupons", icon: Ticket },
  ]},
  { group: "Community", items: [
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/reviews", label: "Reviews", icon: Star },
  ]},
  { group: "Content", items: [
    { to: "/blog", label: "Blog", icon: FileText },
  ]},
  { group: "System", items: [
    { to: "/audit", label: "Audit Log", icon: Shield },
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { profile, signOut } = useAuth();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#2a2d3a] bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#2a2d3a] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
          <span className="text-xs font-bold text-gold">P</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">PEHNAV</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.group} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              {group.group}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mb-0.5 ${
                  isActive(item.to)
                    ? "bg-gold/15 text-gold font-medium"
                    : "text-gray-400 hover:bg-sidebar-hover hover:text-gray-200"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2a2d3a] p-3 space-y-1">
        <a
          href={import.meta.env.VITE_STORE_URL ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-sidebar-hover hover:text-gray-200 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </a>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        <div className="px-3 pt-2 pb-1">
          <p className="text-xs font-medium text-gray-300 truncate">{profile?.full_name ?? profile?.email}</p>
          <p className="text-[10px] text-gray-600 truncate">{profile?.email}</p>
        </div>
      </div>
    </aside>
  );
}
