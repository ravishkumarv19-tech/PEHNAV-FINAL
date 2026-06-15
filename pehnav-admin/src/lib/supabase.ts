import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  throw new Error("Missing Supabase env vars. Copy .env.example → .env");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending" | "processing" | "packed" | "shipped" | "delivered"
  | "cancelled" | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
}

export interface Product {
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

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  status: OrderStatus;
  shipping_name: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  payment_status: PaymentStatus;
  razorpay_payment_id: string | null;
  tracking_number: string | null;
  courier: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
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

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  status: ReviewStatus;
  created_at: string;
}

export interface Coupon {
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

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_value: object | null;
  new_value: object | null;
  ip_address: string | null;
  created_at: string;
}
