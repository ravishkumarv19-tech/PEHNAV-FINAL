import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
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

function dbProductToLocal(p: any): Product {
  return {
    id: p.id,
    name: { en: p.name_en ?? p.name ?? "", hi: p.name_hi ?? p.name_en ?? p.name ?? "" },
    price: p.price,
    compareAt: p.compare_at ?? undefined,
    image: p.image_url ?? p.image ?? "",
    gallery: p.gallery ?? [],
    category: p.category,
    group: p.product_group ?? p.group ?? "",
    gender: p.gender,
    collection: p.collection ?? undefined,
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    rating: p.rating ?? 4.5,
    reviewCount: p.review_count ?? 0,
    badge: p.badge ?? undefined,
    story: { en: p.story_en ?? "", hi: p.story_hi ?? p.story_en ?? "" },
    description: { en: p.description_en ?? "", hi: p.description_hi ?? p.description_en ?? "" },
    inStock: p.in_stock ?? true,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  // Use a ref so syncCartToServer always sees current cart
  const cartRef = useRef<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const c = localStorage.getItem("pehnav-cart");
      const w = localStorage.getItem("pehnav-wishlist");
      if (c) {
        const parsed = JSON.parse(c);
        setCart(parsed);
        cartRef.current = parsed;
      }
      if (w) setWishlist(JSON.parse(w));
    } catch { /* ignore corrupted storage */ }
  }, []);

  // Persist to localStorage on every cart change
  useEffect(() => {
    cartRef.current = cart;
    localStorage.setItem("pehnav-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("pehnav-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Auto-sync when user logs in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await syncCartToServer(session.user.id);
          await syncCartFromServer(session.user.id);
        }
        if (event === "SIGNED_OUT") {
          // Keep local cart but clear wishlist (wishlist is user-specific)
          setWishlist([]);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const addToCart: StoreCtx["addToCart"] = (product, size, color, qty = 1) => {
    const id = lineId(product.id, size, color);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => i.id === id ? { ...i, qty: Math.min(i.qty + qty, 10) } : i);
      return [...prev, { id, product, size, color, qty }];
    });
  };

  const removeFromCart = (id: string) => setCart((p) => p.filter((i) => i.id !== id));

  const updateQty = (id: string, qty: number) =>
    setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 10)) } : i));

  const clearCart = () => {
    setCart([]);
    cartRef.current = [];
    localStorage.removeItem("pehnav-cart");
  };

  const toggleWishlist = useCallback(async (productId: string) => {
    setWishlist((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((x) => x !== productId)
        : [...prev, productId];
      return next;
    });

    // Sync wishlist to server if signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const isInWishlist = wishlist.includes(productId);
    if (isInWishlist) {
      await supabase.from("wishlists")
        .delete()
        .match({ user_id: session.user.id, product_id: productId });
    } else {
      await supabase.from("wishlists")
        .upsert({ user_id: session.user.id, product_id: productId });
    }
  }, [wishlist]);

  const inWishlist = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  // Use ref so this always reads the latest cart without stale closure
  const syncCartToServer = useCallback(async (userId: string) => {
    const currentCart = cartRef.current;
    if (currentCart.length === 0) return;
    for (const item of currentCart) {
      await supabase.from("cart_items").upsert({
        user_id: userId,
        product_id: item.product.id,
        size: item.size,
        color: item.color,
        qty: item.qty,
      }, { onConflict: "user_id,product_id,size,color" });
    }
  }, []); // no deps — uses ref

  const syncCartFromServer = useCallback(async (userId: string) => {
    const [{ data: cartData }, { data: wlData }] = await Promise.all([
      supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", userId),
      supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", userId),
    ]);

    if (cartData) {
      setCart((localCart) => {
        const merged = [...localCart];
        for (const row of cartData) {
          const id = lineId(row.product_id, row.size, row.color);
          const exists = merged.find((i) => i.id === id);
          if (!exists && row.product) {
            merged.push({
              id,
              product: dbProductToLocal(row.product as any),
              size: row.size,
              color: row.color,
              qty: row.qty,
            });
          }
        }
        return merged;
      });
    }

    if (wlData) {
      setWishlist(wlData.map((r: any) => r.product_id));
    }
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.qty * i.product.price, 0), [cart]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartCount,
      cartTotal,
      toggleWishlist,
      inWishlist,
      syncCartToServer,
      syncCartFromServer,
    }),
    [cart, wishlist, cartCount, cartTotal, toggleWishlist, inWishlist, syncCartToServer, syncCartFromServer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
