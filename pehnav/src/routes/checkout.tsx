import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ChevronRight, Tag, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — PEHNAV" }] }),
  component: Checkout,
});

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
  "West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh",
];

function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const { user, profile } = useAuth();
  const { tl } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<"shipping" | "payment" | "done">("shipping");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });

  const [completedOrder, setCompletedOrder] = useState<{ number: string; total: number } | null>(null);

  useEffect(() => {
    if (profile) {
      setForm((p) => ({
        ...p,
        full_name: profile.full_name ?? p.full_name,
        email: profile.email ?? p.email,
        phone: profile.phone ?? p.phone,
      }));
    }
  }, [profile]);

  const shipping = cartTotal > 1499 ? 0 : 99;
  const subtotal = cartTotal;
  const total = subtotal - couponDiscount + shipping;

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("active", true)
      .single();

    if (error || !data) { setCouponError("Invalid or expired coupon"); return; }
    if (data.min_spend && subtotal < data.min_spend) {
      setCouponError(`Min. spend ₹${data.min_spend} required`); return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired"); return;
    }

    const discount = data.type === "percent"
      ? Math.round((data.value / 100) * subtotal)
      : Math.min(data.value, subtotal);
    setCouponDiscount(discount);
    setAppliedCoupon(data.code);
    toast.success(`Coupon applied! You saved ${formatPrice(discount)}`);
  };

  const handlePayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Payment service unavailable. Check your connection.");
      setLoading(false);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // If no Razorpay key configured, use test mode simulation
    if (!keyId || keyId === "rzp_test_xxxxxxxxxxxxxxxx") {
      // Simulate payment for development
      await createOrder("dev_order_" + Date.now(), "dev_payment_" + Date.now());
      return;
    }

    // Create Razorpay order via Supabase Edge Function
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
      },
      body: JSON.stringify({ amount: total * 100 }), // Razorpay expects paise
    });

    if (!res.ok) {
      toast.error("Couldn't create payment. Please try again.");
      setLoading(false);
      return;
    }

    const { id: razorpayOrderId } = await res.json();

    const rzp = new window.Razorpay({
      key: keyId,
      amount: total * 100,
      currency: "INR",
      name: "PEHNAV",
      description: "Wear Your Story",
      order_id: razorpayOrderId,
      prefill: {
        name: form.full_name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: "#BFA16A" },
      handler: async (response: any) => {
        // Pass full Razorpay response to server for HMAC verification
        await createOrder(
          razorpayOrderId,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
      },
      modal: {
        ondismiss: () => { setLoading(false); },
      },
    });
    rzp.open();
  };

  const createOrder = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) => {
    // Step 1: Create order with payment_status = "pending" — NOT "paid"
    // The server will set it to "paid" only after HMAC verification.
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email: form.email,
        phone: form.phone,
        shipping_name: form.full_name,
        shipping_phone: form.phone,
        shipping_line1: form.line1,
        shipping_line2: form.line2 || null,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        subtotal,
        discount: couponDiscount,
        shipping_fee: shipping,
        total,
        coupon_code: appliedCoupon || null,
        payment_status: "pending",   // ← ALWAYS pending until server verifies
        status: "pending",
        razorpay_order_id: razorpayOrderId,
      })
      .select()
      .single();

    if (error || !order) {
      toast.error("Order creation failed. Contact support.");
      setLoading(false);
      return;
    }

    // Step 2: Insert order items
    await supabase.from("order_items").insert(
      cart.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: tl(i.product.name),
        image_url: i.product.image,
        size: i.size,
        color: i.color,
        qty: i.qty,
        unit_price: i.product.price,
        total_price: i.product.price * i.qty,
      }))
    );

    // Step 3: Call server-side edge function to verify Razorpay HMAC signature
    // This is the ONLY place payment_status gets set to "paid"
    const { data: { session } } = await supabase.auth.getSession();
    const verifyRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          order_id: order.id,
        }),
      }
    );

    if (!verifyRes.ok) {
      toast.error("Payment verification failed. If money was deducted, contact support with your order ID: " + order.order_number);
      setLoading(false);
      return;
    }

    // Step 4: Increment coupon usage atomically server-side
    if (appliedCoupon) {
      await supabase.rpc("increment_coupon_usage", { p_code: appliedCoupon });
    }

    clearCart();
    setCompletedOrder({ number: order.order_number, total: order.total });
    setStep("done");
    setLoading(false);
  };

  // ─── Empty Cart ──────────────────────────────────────────────────────────────
  if (cart.length === 0 && step !== "done") {
    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        <p className="text-lg text-muted-foreground">Your cart is empty.</p>
        <Link to="/shop" className="mt-4 inline-block text-gold underline">Shop now</Link>
      </div>
    );
  }

  // ─── Done ────────────────────────────────────────────────────────────────────
  if (step === "done" && completedOrder) {
    const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      color: ["#BFA16A", "#D8C3A5", "#000", "#F5F5F5", "#BFA16A"][i % 5],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.6}s`,
      duration: `${1.2 + Math.random() * 0.8}s`,
      size: `${6 + Math.random() * 8}px`,
    }));

    return (
      <div className="mx-auto max-w-md px-6 py-32 text-center">
        {/* Confetti */}
        <div className="pointer-events-none fixed inset-x-0 top-0 overflow-hidden" aria-hidden>
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: p.left,
                top: "-20px",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animation: `confetti-fall ${p.duration} ease ${p.delay} forwards`,
              }}
            />
          ))}
        </div>

        {/* Animated success circle + checkmark */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 animate-scale-in">
          <svg viewBox="0 0 36 36" className="h-10 w-10" fill="none">
            <circle cx="18" cy="18" r="17" stroke="#10b981" strokeWidth="2" opacity="0.3" />
            <polyline
              points="10,18 16,24 26,12"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="80"
              className="animate-check-draw"
            />
          </svg>
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold animate-fade-up" style={{ animationDelay: "0.4s" }}>
          Order Confirmed!
        </h1>
        <p className="mt-3 text-muted-foreground animate-fade-up" style={{ animationDelay: "0.55s" }}>
          Order <strong>{completedOrder.number}</strong> for {formatPrice(completedOrder.total)} is placed.
          You'll receive a confirmation email shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <Link
            to="/track"
            className="rounded-md bg-foreground px-8 py-3 text-sm uppercase tracking-wider text-background transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Track Your Order
          </Link>
          <Link to="/shop" className="text-sm text-gold underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold transition-colors";

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/cart" className="hover:text-foreground">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className={step === "shipping" ? "text-foreground font-medium" : ""}>Shipping</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step === "payment" ? "text-foreground font-medium" : ""}>Payment</span>
      </div>

      <h1 className="font-display text-4xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">

        {/* ─── Left: Shipping or Payment ─────────────────────────────── */}
        <div>
          {step === "shipping" && (
            <div className="space-y-4 animate-step-slide-in">
              <h2 className="eyebrow text-gold">Contact & Delivery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Full name" required className={inputCls} />
                <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone number" required className={inputCls} />
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email address" required className={`${inputCls} sm:col-span-2`} />
              </div>

              <h2 className="eyebrow text-gold pt-2">Shipping Address</h2>
              <input value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                placeholder="Address line 1" required className={inputCls} />
              <input value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
                placeholder="Address line 2 (optional)" className={inputCls} />
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City" required className={inputCls} />
                <select value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  className={inputCls}>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                  placeholder="Pincode" maxLength={6} required className={inputCls} />
              </div>

              <button
                onClick={() => {
                  const { full_name, email, phone, line1, city, pincode } = form;
                  if (!full_name || !email || !phone || !line1 || !city || !pincode) {
                    toast.error("Please fill all required fields"); return;
                  }
                  setStep("payment");
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-4 text-sm uppercase tracking-wider text-background"
              >
                Continue to Payment <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4 animate-step-slide-in">
              <button onClick={() => setStep("shipping")} className="text-sm text-muted-foreground underline">
                ← Edit shipping
              </button>

              <div className="rounded-md border border-border bg-card p-4 text-sm">
                <p className="font-medium">{form.full_name}</p>
                <p className="text-muted-foreground">{form.line1}, {form.city}, {form.state} – {form.pincode}</p>
                <p className="text-muted-foreground">{form.phone} · {form.email}</p>
              </div>

              <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Secure Payment via Razorpay</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports UPI, credit/debit cards, net banking, and wallets.
                  Your payment info is encrypted and never stored by us.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-4 text-sm uppercase tracking-wider text-background disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Pay {formatPrice(total)} Securely
              </button>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary ──────────────────────────────────── */}
        <aside className="h-fit rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Order Summary</h2>

          <ul className="mt-4 space-y-3">
            {cart.map((i) => (
              <li key={i.id} className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <img src={i.product.image} alt={tl(i.product.name)} className="h-14 w-14 rounded-md object-cover border border-border" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">{i.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tl(i.product.name)}</p>
                  <p className="text-xs text-muted-foreground">{i.size} · {i.color}</p>
                </div>
                <p className="text-sm font-medium">{formatPrice(i.product.price * i.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-border pt-4">
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button onClick={applyCoupon} className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary">
                <Tag className="h-3 w-3" /> Apply
              </button>
            </div>
            {couponError && <p className="mt-1 text-xs text-destructive">{couponError}</p>}
            {appliedCoupon && <p className="mt-1 text-xs text-emerald-600">✓ {appliedCoupon} applied</p>}
          </div>

          <div className="mt-4 space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>− {formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Shipping</span>
              <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Add {formatPrice(1499 - subtotal)} more for free shipping
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
