import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import type { Product } from "./data";
import { supabase } from "./supabase";

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  qty: number;
}

interface StoreCtx {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  syncCartToServer: (userId: string) => Promise<void>;
  syncCartFromServer: (userId: string) => Promise<void>;
}

const Ctx = createContext<StoreCtx | null>(null);
const lineId = (p: string, s: string, c: string) => `${p}__${s}__${c}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const c = localStorage.getItem("pehnav-cart");
      const w = localStorage.getItem("pehnav-wishlist");
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage whenever cart/wishlist change
  useEffect(() => {
    localStorage.setItem("pehnav-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("pehnav-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart: StoreCtx["addToCart"] = (product, size, color, qty = 1) => {
    const id = lineId(product.id, size, color);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => i.id === id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id, product, size, color, qty }];
    });
  };

  const removeFromCart = (id: string) => setCart((p) => p.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) =>
    setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
  const clearCart = () => setCart([]);

  const toggleWishlist = (id: string) =>
    setWishlist((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const inWishlist = (id: string) => wishlist.includes(id);

  // Merge local cart → Supabase when user logs in
  const syncCartToServer = useCallback(async (userId: string) => {
    for (const item of cart) {
      await supabase.from("cart_items").upsert({
        user_id: userId,
        product_id: item.product.id,
        size: item.size,
        color: item.color,
        qty: item.qty,
      }, { onConflict: "user_id,product_id,size,color" });
    }
  }, [cart]);

  // Load server cart when user logs in (merge with local)
  const syncCartFromServer = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(*)")
      .eq("user_id", userId);

    if (!data) return;

    setCart((localCart) => {
      const merged = [...localCart];
      for (const row of data) {
        const id = lineId(row.product_id, row.size, row.color);
        const existing = merged.find((i) => i.id === id);
        if (!existing && row.product) {
          // Map DB product to local Product shape
          const p = row.product as any;
          merged.push({
            id,
            product: {
              id: p.id,
              name: { en: p.name_en, hi: p.name_hi },
              price: p.price,
              compareAt: p.compare_at ?? undefined,
              image: p.image_url,
              gallery: p.gallery,
              category: p.category,
              group: p.product_group,
              gender: p.gender,
              collection: p.collection ?? undefined,
              colors: p.colors,
              sizes: p.sizes,
              rating: p.rating,
              reviewCount: p.review_count,
              badge: p.badge ?? undefined,
              story: { en: p.story_en, hi: p.story_hi },
              description: { en: p.description_en, hi: p.description_hi },
              inStock: p.in_stock,
            },
            size: row.size,
            color: row.color,
            qty: row.qty,
          });
        }
      }
      return merged;
    });

    // Sync wishlist
    const { data: wl } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);
    if (wl) setWishlist(wl.map((r: any) => r.product_id));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  const value = useMemo(
    () => ({ cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, toggleWishlist, inWishlist, syncCartToServer, syncCartFromServer }),
    [cart, wishlist, cartCount, cartTotal, syncCartToServer, syncCartFromServer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
