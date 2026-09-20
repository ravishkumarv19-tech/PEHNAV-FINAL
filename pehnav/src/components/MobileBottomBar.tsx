import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Search, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";

interface MobileBottomBarProps {
  onSearchClick?: () => void;
}

export default function MobileBottomBar({ onSearchClick }: MobileBottomBarProps) {
  const { cartCount, wishlist } = useStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Don't render bottom bar on checkout flow
  if (currentPath === "/checkout") return null;

  const wishlistCount = wishlist.length;

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
      isActive: currentPath === "/",
    },
    {
      label: "Shop",
      to: "/shop",
      icon: Compass,
      isActive: currentPath === "/shop" || currentPath.startsWith("/collections"),
    },
    {
      label: "Search",
      action: onSearchClick,
      icon: Search,
      isActive: false,
    },
    {
      label: "Wishlist",
      to: "/wishlist",
      icon: Heart,
      badge: wishlistCount,
      isActive: currentPath === "/wishlist",
    },
    {
      label: "Bag",
      to: "/cart",
      icon: ShoppingBag,
      badge: cartCount,
      isActive: currentPath === "/cart",
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden pointer-events-none">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto mx-auto border-t border-white/10 bg-[#08080a]/92 backdrop-blur-2xl px-2 pt-2 pb-[max(env(safe-area-inset-bottom,0px),10px)] shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div
                className={`relative flex min-h-[48px] min-w-[54px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition-all active:scale-90 ${
                  item.isActive
                    ? "text-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 transition-transform ${
                      item.isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                    }`}
                  />
                  {/* Badge */}
                  {Boolean(item.badge && item.badge > 0) && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan px-1 text-[9px] font-mono font-black text-black shadow-[0_0_8px_#38bdf8]">
                      {item.badge! > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-mono tracking-wider uppercase leading-none ${
                    item.isActive ? "font-bold text-cyan" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {item.isActive && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-cyan" />
                )}
              </div>
            );

            if (item.action) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  aria-label={item.label}
                  className="touch-manipulation"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                to={item.to!}
                aria-label={item.label}
                className="touch-manipulation"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
