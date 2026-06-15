import { useEffect, useState } from "react";
import { Plus, Loader2, X, ToggleLeft, ToggleRight, Ticket } from "lucide-react";
import { supabase, type Coupon } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { logAudit } from "@/lib/auth";
import { toast } from "sonner";

const EMPTY: Partial<Coupon> = {
  code: "", type: "percent", value: 10, min_spend: 0,
  max_uses: null, active: true, expires_at: null,
};

export default function Coupons() {
  const { user, profile } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!form.code?.trim()) { toast.error("Coupon code is required"); return; }
    setSaving(true);

    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type ?? "percent",
      value: Number(form.value ?? 10),
      min_spend: Number(form.min_spend ?? 0),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      active: form.active ?? true,
      expires_at: form.expires_at || null,
    };

    const { error } = await supabase.from("coupons").insert(payload);
    if (error) { toast.error(error.message); setSaving(false); return; }

    await logAudit(user.id, profile.email, "CREATE_COUPON", "coupons", null, null, payload);
    toast.success(`Coupon ${payload.code} created`);
    setSaving(false);
    setShowForm(false);
    setForm({ ...EMPTY });
    load();
  };

  const toggleActive = async (c: Coupon) => {
    if (!user || !profile) return;
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    await logAudit(user.id, profile.email, "UPDATE_COUPON", "coupons", c.id,
      { active: c.active }, { active: !c.active });
    toast.success(`${c.code} ${!c.active ? "activated" : "deactivated"}`);
    load();
  };

  const fmt = (c: Coupon) =>
    c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`;

  const inputCls = "input";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <span className="rounded-full bg-[#2a2d3a] px-2.5 py-0.5 text-xs text-gray-400">{coupons.length}</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="panel mb-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-white">Create Coupon</p>
            <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
          </div>
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <label className="mb-1.5 block text-xs text-gray-400">Code *</label>
              <input value={form.code ?? ""} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="PEHNAV20" className={inputCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))} className="select">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">
                Value ({form.type === "percent" ? "%" : "₹"})
              </label>
              <input type="number" value={form.value ?? ""} onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))}
                placeholder="10" className={inputCls} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Min. Spend (₹)</label>
              <input type="number" value={form.min_spend ?? 0} onChange={(e) => setForm((p) => ({ ...p, min_spend: Number(e.target.value) }))}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Max Uses (leave blank = unlimited)</label>
              <input type="number" value={form.max_uses ?? ""} onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Unlimited" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-gray-400">Expires At (optional)</label>
              <input type="datetime-local" value={form.expires_at ?? ""} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value || null }))}
                className={inputCls} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-500">
          <Ticket className="h-10 w-10 mb-3" />
          <p>No coupons yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                {["Code", "Discount", "Min. Spend", "Used / Max", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3 font-mono font-semibold text-gold">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-white">{fmt(c)}</td>
                  <td className="px-4 py-3 text-gray-400">{c.min_spend > 0 ? `₹${c.min_spend}` : "None"}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {c.used_count} / {c.max_uses ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-500/15 text-gray-500"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)} title={c.active ? "Deactivate" : "Activate"}
                      className="text-gray-500 hover:text-gold transition-colors">
                      {c.active
                        ? <ToggleRight className="h-5 w-5 text-emerald-400" />
                        : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
