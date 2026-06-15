import { useCallback, useEffect, useMemo, useState } from "react";
import {
  products as seedProducts,
  categories as seedCategories,
  collections as seedCollections,
  blogPosts as seedBlogPosts,
  type Product,
  type Category,
  type Collection,
  type BlogPost,
} from "./data";

/* ---------------------------------- Types --------------------------------- */

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  spent: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  status: "pending" | "approved";
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  active: boolean;
  used: number;
}

export interface AdminState {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  coupons: Coupon[];
  blogPosts: BlogPost[];
}

/* --------------------------------- Seeding -------------------------------- */

const STORAGE_KEY = "pehnav-admin-v1";

const firstNames = ["Aarav", "Isha", "Kabir", "Meera", "Rohan", "Diya", "Vivaan", "Anaya", "Arjun", "Saanvi", "Reyansh", "Myra"];
const lastNames = ["Sharma", "Patel", "Singh", "Reddy", "Nair", "Gupta", "Mehta", "Iyer", "Khan", "Bose"];
const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "delivered", "cancelled"];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedState(): AdminState {
  const customers: Customer[] = Array.from({ length: 12 }, (_, i) => {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    return {
      id: `cust-${i + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, ".")}@example.com`,
      joined: daysAgo(120 - i * 8),
      orders: 0,
      spent: 0,
    };
  });

  const orders: Order[] = Array.from({ length: 24 }, (_, i) => {
    const cust = customers[i % customers.length];
    const count = 1 + (i % 3);
    const items: OrderItem[] = Array.from({ length: count }, (_, j) => {
      const p = seedProducts[(i * 3 + j) % seedProducts.length];
      const qty = 1 + ((i + j) % 2);
      return { productId: p.id, name: p.name.en, price: p.price, qty };
    });
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const status = statuses[i % statuses.length];
    cust.orders += 1;
    if (status !== "cancelled") cust.spent += total;
    return {
      id: `PV${(1042 + i).toString()}`,
      customer: cust.name,
      email: cust.email,
      date: daysAgo(i * 2),
      status,
      items,
      total,
    };
  });

  const reviewText = [
    "Absolutely love the fit and fabric quality.",
    "Premium feel, worth every rupee.",
    "Runs a bit large but the look is amazing.",
    "Fast delivery and beautiful packaging.",
    "The story behind this piece is everything.",
    "Soft, durable and so easy to style.",
  ];
  const reviews: Review[] = Array.from({ length: 16 }, (_, i) => {
    const p = seedProducts[i % seedProducts.length];
    const cust = customers[i % customers.length];
    return {
      id: `rev-${i + 1}`,
      productId: p.id,
      productName: p.name.en,
      author: cust.name,
      rating: 4 + (i % 2),
      text: reviewText[i % reviewText.length],
      date: daysAgo(i * 3),
      status: i % 4 === 0 ? "pending" : "approved",
    };
  });

  const coupons: Coupon[] = [
    { id: "c1", code: "WELCOME10", type: "percent", value: 10, minSpend: 999, active: true, used: 142 },
    { id: "c2", code: "PEHNAV500", type: "fixed", value: 500, minSpend: 2999, active: true, used: 58 },
    { id: "c3", code: "FREESHIP", type: "fixed", value: 99, minSpend: 1499, active: true, used: 311 },
    { id: "c4", code: "FESTIVE20", type: "percent", value: 20, minSpend: 1999, active: false, used: 0 },
  ];

  return {
    products: seedProducts.map((p) => ({ ...p, stock: 5 + ((seedProducts.indexOf(p) * 13) % 80) } as Product & { stock: number })),
    categories: [...seedCategories],
    collections: [...seedCollections],
    orders,
    customers,
    reviews,
    coupons,
    blogPosts: [...seedBlogPosts],
  };
}

/* ---------------------------------- Hook ---------------------------------- */

export function useAdminStore() {
  const [state, setState] = useState<AdminState>(seedState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);

  const reset = useCallback(() => setState(seedState()), []);

  /* Products */
  const saveProduct = useCallback((p: Product) => {
    setState((s) => {
      const exists = s.products.some((x) => x.id === p.id);
      return {
        ...s,
        products: exists ? s.products.map((x) => (x.id === p.id ? p : x)) : [p, ...s.products],
      };
    });
  }, []);
  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
  }, []);
  const setStock = useCallback((id: string, stock: number) => {
    setState((s) => ({
      ...s,
      products: s.products.map((x) =>
        x.id === id ? ({ ...x, stock, inStock: stock > 0 } as Product) : x,
      ),
    }));
  }, []);

  /* Categories */
  const saveCategory = useCallback((c: Category) => {
    setState((s) => {
      const exists = s.categories.some((x) => x.id === c.id);
      return { ...s, categories: exists ? s.categories.map((x) => (x.id === c.id ? c : x)) : [...s.categories, c] };
    });
  }, []);
  const deleteCategory = useCallback((id: string) => {
    setState((s) => ({ ...s, categories: s.categories.filter((x) => x.id !== id) }));
  }, []);

  /* Collections */
  const saveCollection = useCallback((c: Collection) => {
    setState((s) => {
      const exists = s.collections.some((x) => x.id === c.id);
      return { ...s, collections: exists ? s.collections.map((x) => (x.id === c.id ? c : x)) : [...s.collections, c] };
    });
  }, []);
  const deleteCollection = useCallback((id: string) => {
    setState((s) => ({ ...s, collections: s.collections.filter((x) => x.id !== id) }));
  }, []);

  /* Orders */
  const setOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
  }, []);

  /* Reviews */
  const setReviewStatus = useCallback((id: string, status: Review["status"]) => {
    setState((s) => ({ ...s, reviews: s.reviews.map((r) => (r.id === id ? { ...r, status } : r)) }));
  }, []);
  const deleteReview = useCallback((id: string) => {
    setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }));
  }, []);

  /* Coupons */
  const saveCoupon = useCallback((c: Coupon) => {
    setState((s) => {
      const exists = s.coupons.some((x) => x.id === c.id);
      return { ...s, coupons: exists ? s.coupons.map((x) => (x.id === c.id ? c : x)) : [...s.coupons, c] };
    });
  }, []);
  const deleteCoupon = useCallback((id: string) => {
    setState((s) => ({ ...s, coupons: s.coupons.filter((x) => x.id !== id) }));
  }, []);
  const toggleCoupon = useCallback((id: string) => {
    setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) }));
  }, []);

  /* Blog */
  const saveBlogPost = useCallback((b: BlogPost) => {
    setState((s) => {
      const exists = s.blogPosts.some((x) => x.id === b.id);
      return { ...s, blogPosts: exists ? s.blogPosts.map((x) => (x.id === b.id ? b : x)) : [b, ...s.blogPosts] };
    });
  }, []);
  const deleteBlogPost = useCallback((id: string) => {
    setState((s) => ({ ...s, blogPosts: s.blogPosts.filter((x) => x.id !== id) }));
  }, []);

  /* Derived metrics */
  const metrics = useMemo(() => {
    const paidOrders = state.orders.filter((o) => o.status !== "cancelled");
    const revenue = paidOrders.reduce((s, o) => s + o.total, 0);
    const orderCount = state.orders.length;
    const customerCount = state.customers.length;
    const aov = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;

    const byStatus = state.orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const unitsByProduct = new Map<string, number>();
    state.orders.forEach((o) => o.items.forEach((it) => unitsByProduct.set(it.productId, (unitsByProduct.get(it.productId) || 0) + it.qty)));
    const bestSellers = [...state.products]
      .map((p) => ({ product: p, units: unitsByProduct.get(p.id) || 0 }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 6);

    const revenueByDay: { day: string; total: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = daysAgo(i);
      const total = state.orders
        .filter((o) => o.date === day && o.status !== "cancelled")
        .reduce((s, o) => s + o.total, 0);
      revenueByDay.push({ day, total });
    }

    return { revenue, orderCount, customerCount, aov, byStatus, bestSellers, revenueByDay };
  }, [state]);

  return {
    state,
    metrics,
    reset,
    saveProduct,
    deleteProduct,
    setStock,
    saveCategory,
    deleteCategory,
    saveCollection,
    deleteCollection,
    setOrderStatus,
    setReviewStatus,
    deleteReview,
    saveCoupon,
    deleteCoupon,
    toggleCoupon,
    saveBlogPost,
    deleteBlogPost,
  };
}

export type AdminStore = ReturnType<typeof useAdminStore>;
