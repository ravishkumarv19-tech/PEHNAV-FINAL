import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Star, ScrollText, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/orders",    icon: ShoppingBag,     label: "Orders"    },
  { to: "/products",  icon: Package,         label: "Products"  },
  { to: "/customers", icon: Users,           label: "Customers" },
  { to: "/coupons",   icon: Tag,             label: "Coupons"   },
  { to: "/reviews",   icon: Star,            label: "Reviews"   },
  { to: "/audit",     icon: ScrollText,      label: "Audit Log" },
];

export default function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const { profile } = useAuth();
  return (
    <aside className="bg-sidebar flex w-56 flex-col border-r border-[#1e2130]">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1e2130]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#BFA16A]">
          <Zap className="h-4 w-4 text-black" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-widest text-white">PEHNAV</p>
          <p className="text-[9px] text-gray-600 tracking-wider uppercase">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? "bg-[#BFA16A]/15 text-[#BFA16A]" : "text-gray-500 hover:bg-[#1e2130] hover:text-gray-300"}`}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[#1e2130] p-3">
        <div className="mb-2 flex items-center gap-2.5 px-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2d3a] text-xs font-bold text-gray-300">
            {(profile?.full_name ?? profile?.email ?? "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-white">{profile?.full_name ?? "Admin"}</p>
            <p className="truncate text-[10px] text-gray-600">{profile?.email}</p>
          </div>
        </div>
        <button onClick={onSignOut} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-[#1e2130] hover:text-red-400 transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
