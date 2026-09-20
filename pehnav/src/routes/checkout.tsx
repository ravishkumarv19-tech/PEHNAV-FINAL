import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, ChevronRight, Tag, Truck, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — PEHNAV" }] }),
  component: Checkout,
});

declare global {
  interface Window { Razorpay: any; }
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
  const [completedOrder, setCompletedOrder] = useState<{ number: string; total: number; email: string } | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });

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

  // Detect if we're in dev/local mode
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID ?? "";
  const isDevMode =
    !razorpayKey ||
    razorpayKey === "rzp_test_xxxxxxxxxxxxxxxx" ||
    !supabaseUrl ||
    supabaseUrl === "https://your-project.supabase.co";

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    // Dev mode: accept a test coupon
    if (isDevMode) {
      if (couponCode.toUpperCase() === "PEHNAV10") {
        const discount = Math.round(subtotal * 0.1);
        setCouponDiscount(discount);
        setAppliedCoupon("PEHNAV10");
        toast.success(`Coupon applied! You saved ${formatPrice(discount)}`);
      } else {
        setCouponError("Invalid coupon code");
      }
      return;
    }

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

  const createOrder = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string = "",
  ) => {
    const isSimulated = razorpayOrderId.startsWith("dev_order_");

    try {
      // Write order to Supabase
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
          payment_status: isSimulated ? "paid" : "pending",
          status: "pending",
          razorpay_order_id: razorpayOrderId,
        })
        .select()
        .single();

      if (!error && order) {
        if (cart.length > 0) {
          const { error: itemsErr } = await supabase.from("order_items").insert(
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
          if (itemsErr) {
            console.warn("Order items insert warning:", itemsErr);
          }
        }

        if (!isSimulated && !isDevMode) {
          // Verify payment HMAC server-side for real gateway
          const { data: { session } } = await supabase.auth.getSession();
          const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
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
          });

          if (!verifyRes.ok) {
            toast.error(`Payment verification failed. Contact support with Order ID: ${order.order_number ?? order.id.slice(0, 8)}`);
            setLoading(false);
            return;
          }
        }

        if (appliedCoupon) {
          try {
            await supabase.rpc("increment_coupon_usage", { p_code: appliedCoupon });
          } catch (e) {
            console.warn("Coupon increment failed:", e);
          }
        }

        const finalOrderNumber = order.order_number || `PHN-${order.id.slice(0, 6).toUpperCase()}`;

        // Send luxury branded confirmation email via Resend
        try {
          const emailPayload = {
            order_number: finalOrderNumber,
            email: form.email,
            customer_name: form.full_name,
            phone: form.phone,
            shipping_address: {
              line1: form.line1,
              line2: form.line2,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },
            items: cart.map((i) => ({
              product_name: tl(i.product.name),
              size: i.size,
              color: i.color,
              qty: i.qty,
              unit_price: i.product.price,
              total_price: i.product.price * i.qty,
              image_url: i.product.image,
            })),
            subtotal,
            discount: couponDiscount,
            shipping_fee: shipping,
            total,
            coupon_code: appliedCoupon || null,
            created_at: order.created_at,
          };

          sendOrderConfirmationEmail(emailPayload).then((res) => {
            if (res.success) {
              toast.success(`Confirmation email sent to ${form.email}`);
            } else {
              console.warn("Could not dispatch confirmation email:", res.error);
            }
          });
        } catch (emailErr) {
          console.warn("Failed to initiate confirmation email:", emailErr);
        }

        clearCart();
        setCompletedOrder({
          number: finalOrderNumber,
          total: order.total,
          email: form.email,
        });
        setStep("done");
        setLoading(false);
        return;
      } else if (error) {
        console.error("Order save error from Supabase:", error);
        toast.error(`Order could not be saved: ${error.message}`);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Unexpected checkout error:", err);
      toast.error(`Failed to place order: ${err?.message || "Please check your connection."}`);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handlePayment = async () => {
    setLoading(true);

    // ── DEV / SIMULATION MODE ────────────────────────────────────────────────
    if (isDevMode) {
      toast.info("Dev mode — simulating payment…");
      await new Promise((r) => setTimeout(r, 1400));
      await createOrder("dev_order_" + Date.now(), "dev_pay_" + Date.now(), "");
      return;
    }

    // ── PRODUCTION: Real Razorpay ────────────────────────────────────────────
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Could not load payment gateway. Check your internet connection.");
      setLoading(false);
      return;
    }

    // Step 1: Create Razorpay order via Edge Function
    let razorpayOrderId: string;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
          Authorization: `Bearer ${session?.access_token ?? anonKey}`,
        },
        body: JSON.stringify({ amount: total * 100 }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("create-razorpay-order failed:", res.status, errBody);
        throw new Error(errBody?.error ?? `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.id) throw new Error("No order ID returned from payment server");
      razorpayOrderId = json.id;
    } catch (err: any) {
      console.error("Payment init error:", err);
      toast.error(
        err.message?.includes("Failed to fetch")
          ? "Payment server unreachable. Make sure the Supabase edge function is deployed."
          : `Payment error: ${err.message ?? "Please try again."}`,
        { duration: 6000 }
      );
      setLoading(false);
      return;
    }

    // Step 2: Open Razorpay checkout
    const rzp = new window.Razorpay({
      key: razorpayKey,
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
        await createOrder(
          response.razorpay_order_id,
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
    return (
      <div className="mx-auto max-w-lg px-6 py-28 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <svg viewBox="0 0 36 36" className="h-10 w-10 text-emerald-500" fill="none">
            <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <polyline points="10,18 16,24 26,12" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl font-bold">Order Confirmed!</h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
          Thank you! Order <span className="font-semibold text-foreground">{completedOrder.number}</span> for{" "}
          <span className="font-semibold text-gold">{formatPrice(completedOrder.total)}</span> has been placed successfully.
        </p>

        {/* Email sent callout banner */}
        <div className="mt-6 rounded-xl border border-border/80 bg-card p-4 text-left sm:flex sm:items-center sm:gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold text-lg">
            ✉️
          </div>
          <div className="mt-2 sm:mt-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Email Dispatched</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A luxury confirmation invoice & tracking details have been sent to{" "}
              <strong className="text-foreground font-medium">{completedOrder.email}</strong>.
            </p>
          </div>
        </div>

        {isDevMode && (
          <p className="mt-4 text-xs text-amber-500 bg-amber-500/10 rounded-md py-2 px-3 border border-amber-500/20">
            ⚡ Dev Mode simulation active — order stored in Supabase with live tracking.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/track"
            search={{ q: completedOrder.number.replace(/^#/, "") } as any}
            className="rounded-md bg-foreground px-8 py-3.5 text-sm uppercase tracking-wider text-background hover:bg-gold hover:text-black font-semibold transition-all shadow-md active:scale-[0.99]"
          >
            Track Your Order Live
          </Link>
          <Link to="/shop" className="text-sm text-gold hover:underline mt-1">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold transition-colors";

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-6 sm:mb-8 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-mono">
        <Link to="/cart" className="hover:text-foreground">Cart</Link>
        <ChevronRight className="h-4 w-4" />
        <span className={step === "shipping" ? "text-foreground font-medium" : ""}>Shipping</span>
        <ChevronRight className="h-4 w-4" />
        <span className={step === "payment" ? "text-foreground font-medium" : ""}>Payment</span>
      </div>

      <h1 className="font-display text-4xl font-bold">Checkout</h1>

      {/* Dev mode banner */}
      {isDevMode && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Dev mode active</strong> — payment will be simulated, no real charge.
            {!razorpayKey || razorpayKey === "rzp_test_xxxxxxxxxxxxxxxx"
              ? " Add VITE_RAZORPAY_KEY_ID to .env to enable real payments."
              : " Deploy the create-razorpay-order Supabase function to go live."}
          </span>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">

        {/* ─── Left ─────────────────────────────────────────────────── */}
        <div>
          {step === "shipping" && (
            <div className="space-y-4">
              <h2 className="eyebrow text-gold">Contact & Delivery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  placeholder="Full name *" className={inputCls} />
                <input value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone number *" className={inputCls} />
                <input type="email" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email address *" className={`${inputCls} sm:col-span-2`} />
              </div>

              <h2 className="eyebrow text-gold pt-2">Shipping Address</h2>
              <input value={form.line1}
                onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))}
                placeholder="Address line 1 *" className={inputCls} />
              <input value={form.line2}
                onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))}
                placeholder="Address line 2 (optional)" className={inputCls} />
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City *" className={inputCls} />
                <select value={form.state}
                  onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                  className={inputCls}>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input value={form.pincode}
                  onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                  placeholder="Pincode *" maxLength={6} className={inputCls} />
              </div>

              <button
                onClick={() => {
                  const { full_name, email, phone, line1, city, pincode } = form;
                  if (!full_name || !email || !phone || !line1 || !city || !pincode) {
                    toast.error("Please fill all required fields marked with *"); return;
                  }
                  if (!/^\d{6}$/.test(pincode)) {
                    toast.error("Please enter a valid 6-digit pincode"); return;
                  }
                  if (!/\S+@\S+\.\S+/.test(email)) {
                    toast.error("Please enter a valid email address"); return;
                  }
                  setStep("payment");
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-4 text-sm uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
              >
                Continue to Payment <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <button onClick={() => setStep("shipping")}
                className="text-sm text-muted-foreground underline">← Edit shipping</button>

              <div className="rounded-md border border-border bg-card p-4 text-sm">
                <p className="font-medium">{form.full_name}</p>
                <p className="text-muted-foreground">
                  {form.line1}{form.line2 ? `, ${form.line2}` : ""}, {form.city}, {form.state} – {form.pincode}
                </p>
                <p className="text-muted-foreground">{form.phone} · {form.email}</p>
              </div>

              <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">
                    {isDevMode ? "Simulated Payment (Dev Mode)" : "Secure Payment via Razorpay"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isDevMode
                    ? "No real money will be charged. This is a development simulation."
                    : "Supports UPI, credit/debit cards, net banking, and wallets. Your payment info is encrypted and never stored by us."}
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-4 text-sm uppercase tracking-wider text-background disabled:opacity-60 hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                  : <><ShieldCheck className="h-4 w-4" />
                    {isDevMode ? "Simulate Payment" : `Pay ${formatPrice(total)} Securely`}
                  </>
                }
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
                  <img src={i.product.image} alt={tl(i.product.name)}
                    className="h-14 w-14 rounded-md object-cover border border-border" />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                    {i.qty}
                  </span>
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
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder={isDevMode ? "Try: PEHNAV10" : "Coupon code"}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button onClick={applyCoupon}
                className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary transition-colors">
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