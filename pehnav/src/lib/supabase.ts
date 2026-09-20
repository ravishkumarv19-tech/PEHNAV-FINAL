import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️  Supabase env vars not set. Auth features will not work.\n" +
    "Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ─── Database Types ────────────────────────────────────────────────────────────

export interface DBProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
}

export interface DBAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface DBProduct {
  id: string;
  name_en: string;
  name_hi: string;
  price: number;
  compare_at: number | null;
  image_url: string;
  gallery: string[];
  category: string;
  product_group: string;
  gender: "men" | "women" | "unisex";
  collection: string | null;
  colors: string[];
  sizes: string[];
  rating: number;
  review_count: number;
  badge: "new" | "bestseller" | "limited" | null;
  in_stock: boolean;
  stock: number;
  story_en: string;
  story_hi: string;
  description_en: string;
  description_hi: string;
  created_at: string;
  updated_at: string;
}

export interface DBOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  status: "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";
  shipping_name: string;
  shipping_phone: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  courier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  image_url: string;
  size: string;
  color: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

export interface DBReview {
  id: string;
  product_id: string;
  user_id: string | null;
  order_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  verified: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface DBCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_spend: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
}

export interface DBCartItem {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  color: string;
  qty: number;
}

// Alias for backward compat
export type Profile = DBProfile;

export interface DBOrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}
