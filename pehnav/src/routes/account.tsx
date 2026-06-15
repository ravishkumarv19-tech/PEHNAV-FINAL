import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Package, Heart, MapPin, RotateCcw, Bell, LogOut, Plus, Edit2, Trash2, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase, type DBOrder, type DBOrderItem, type DBAddress } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — PEHNAV" }] }),
  component: Account,
});

type AuthMode = "signin" | "signup" | "otp" | "otp-verify";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "notifications", label: "Notifications", icon: Bell },
];

function AuthWall() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error);
      } else if (mode === "signup") {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) setError(error);
        else toast.success("Account created! Check your email to verify.");
      } else if (mode === "otp") {
        const { error } = await signInWithOtp(email);
        if (error) setError(error);
        else { setOtpSent(true); setMode("otp-verify"); }
      } else if (mode === "otp-verify") {
        const { error } = await verifyOtp(email, otp);
        if (error) setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-bold">
        {mode === "signup" ? "Create Account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signup" ? "Start wearing your story." : "Sign in to access your story."}
      </p>
      {error && <div className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {mode !== "otp" && mode !== "otp-verify" && (
        <>
          <form onSubmit={handle} className="mt-6 space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required
                className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-3 text-sm uppercase tracking-wider text-background disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
          <div className="mt-4 space-y-2">
            <button onClick={async () => { setLoading(true); await signInWithGoogle(); setLoading(false); }} disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-3 text-sm disabled:opacity-60">
              Continue with Google
            </button>
            <button onClick={() => setMode("otp")} className="w-full rounded-md border border-border py-3 text-sm">Login with OTP</button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "signin"
              ? <><span>New here? </span><button onClick={() => setMode("signup")} className="text-gold underline">Create account</button></>
              : <><span>Already have an account? </span><button onClick={() => setMode("signin")} className="text-gold underline">Sign in</button></>}
          </p>
        </>
      )}
      {(mode === "otp" || mode === "otp-verify") && (
        <form onSubmit={handle} className="mt-6 space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={otpSent}
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold disabled:opacity-60" />
          {mode === "otp-verify" && (
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP from your email" maxLength={6} required
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm outline-none focus:border-gold" />
          )}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-foreground py-3 text-sm uppercase tracking-wider text-background disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "otp" ? "Send OTP" : "Verify & Sign In"}
          </button>
          <button type="button" onClick={() => { setMode("signin"); setOtpSent(false); setOtp(""); }}
            className="w-full text-center text-xs text-muted-foreground underline">Back to sign in</button>
        </form>
      )}
    </div>
  );
}

function ProfileTab() {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProfile({ full_name: name, phone });
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Profile updated"); setEditing(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Profile</h2>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-sm text-gold">
          <Edit2 className="h-4 w-4" /> Edit
        </button>
      </div>
      {editing ? (
        <form onSubmit={save} className="mt-6 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number"
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
          <input value={profile?.email ?? ""} disabled
            className="w-full rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-border px-6 py-2.5 text-sm">Cancel</button>
            <button disabled={loading} className="flex items-center gap-2 rounded-md bg-foreground px-6 py-2.5 text-sm text-background disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4 text-sm">
          <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p><p className="mt-1 font-medium">{profile?.full_name || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p><p className="mt-1 font-medium">{profile?.email}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p><p className="mt-1 font-medium">{profile?.phone || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Member since</p>
            <p className="mt-1 font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "—"}</p></div>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<(DBOrder & { order_items: DBOrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as any) ?? []); setLoading(false); });
  }, [user]);

  const statusColor = (s: string) => {
    if (s === "delivered") return "text-emerald-600 bg-emerald-50";
    if (s === "shipped") return "text-blue-600 bg-blue-50";
    if (s === "cancelled") return "text-red-600 bg-red-50";
    return "text-amber-600 bg-amber-50";
  };

  if (loading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (orders.length === 0) return (
    <div className="py-12 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
      <Link to="/shop" className="mt-4 inline-block text-gold underline text-sm">Browse products</Link>
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6">Your Orders</h2>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-md border border-border bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{o.order_number}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" · "}{o.order_items.length} item{o.order_items.length !== 1 ? "s" : ""}
                  {" · "}{formatPrice(o.total)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(o.status)}`}>{o.status}</span>
                <Link to="/track" className="text-xs text-gold underline">Track</Link>
              </div>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {o.order_items.map((item) => (
                <div key={item.id} className="flex-shrink-0 text-xs text-muted-foreground">
                  <img src={item.image_url} alt={item.product_name} className="h-16 w-16 rounded-md object-cover border border-border" />
                  <p className="mt-1 max-w-16 truncate">{item.product_name}</p>
                  <p>{item.size} · ×{item.qty}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<DBAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setAddresses((data as DBAddress[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await supabase.from("addresses").insert({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    setSaving(false);
    toast.success("Address saved");
    setAdding(false);
    setForm({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    load();
  };

  const inputCls = "w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold";

  if (loading) return <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">Saved Addresses</h2>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1.5 text-sm text-gold">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>
      {adding && (
        <form onSubmit={save} className="mb-6 rounded-md border border-gold/40 bg-card p-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Full name" required value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} className={inputCls} />
            <input placeholder="Phone" required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
          </div>
          <input placeholder="Address line 1" required value={form.line1} onChange={(e) => setForm((p) => ({ ...p, line1: e.target.value }))} className={inputCls} />
          <input placeholder="Line 2 (optional)" value={form.line2} onChange={(e) => setForm((p) => ({ ...p, line2: e.target.value }))} className={inputCls} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="City" required value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className={inputCls} />
            <input placeholder="State" required value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} className={inputCls} />
            <input placeholder="Pincode" required maxLength={6} value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAdding(false)} className="rounded-md border border-border px-5 py-2.5 text-sm">Cancel</button>
            <button disabled={saving} className="flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </div>
        </form>
      )}
      {addresses.length === 0 && !adding && <p className="text-sm text-muted-foreground py-8 text-center">No saved addresses yet.</p>}
      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className={`rounded-md border p-4 text-sm ${a.is_default ? "border-gold/50 bg-gold/5" : "border-border bg-background"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{a.full_name} {a.is_default && <span className="ml-2 text-xs text-gold font-normal">Default</span>}</p>
                <p className="mt-1 text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p className="text-muted-foreground">{a.city}, {a.state} — {a.pincode}</p>
                <p className="text-muted-foreground">{a.phone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
                  await supabase.from("addresses").update({ is_default: true }).eq("id", a.id);
                  load();
                }} className="p-1.5 text-muted-foreground hover:text-foreground"><Check className="h-4 w-4" /></button>
                <button onClick={async () => {
                  await supabase.from("addresses").delete().eq("id", a.id);
                  setAddresses((p) => p.filter((x) => x.id !== a.id));
                  toast.success("Removed");
                }} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Account() {
  const { user, loading, signOut } = useAuth();
  const { syncCartFromServer, syncCartToServer } = useStore();
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    if (user) {
      syncCartToServer(user.id).then(() => syncCartFromServer(user.id));
    }
  }, [user]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <AuthWall />;

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <h1 className="font-display text-4xl font-bold">My Account</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {tabs.map((s) => (
            <button key={s.id} onClick={() => setTab(s.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${tab === s.id ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
          <button onClick={signOut} className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>
        <div className="rounded-md border border-border bg-card p-8">
          {tab === "profile" && <ProfileTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "returns" && (
            <div>
              <h2 className="font-display text-xl font-bold">Returns & Exchanges</h2>
              <p className="mt-4 text-sm text-muted-foreground">7-day returns for unused items. Email <a href="mailto:returns@pehnav.com" className="text-gold underline">returns@pehnav.com</a> with your order number.</p>
            </div>
          )}
          {tab === "notifications" && (
            <div><h2 className="font-display text-xl font-bold">Notifications</h2><p className="mt-4 text-sm text-muted-foreground">Notification preferences coming soon.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
