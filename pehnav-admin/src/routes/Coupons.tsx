import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Tag, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase, type Coupon } from "@/lib/supabase";
import { useAuth, logAudit } from "@/lib/auth";
import { toast } from "sonner";

const EMPTY: Partial<Coupon> = {
  code: "", type: "percent", value: 10, min_spend: 0,
  max_uses: null, active: true, expires_at: null,
};

export default function Coupons() {
  const { user, profile } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Load failed: " + error.message);
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing || !user || !profile) return;
    if (!editing.code?.trim()) { toast.error("Coupon code is required"); return; }
    if (!editing.value || editing.value <= 0) { toast.error("Value must be > 0"); return; }
    if (editing.type === "percent" && editing.value > 100) { toast.error("Percent discount cannot exceed 100"); return; }

    setSaving(true);
    const payload = {
      code: editing.code.toUpperCase().trim().replace(/\s+/g, ""),
      type: editing.type ?? "percent",
      value: Number(editing.value),
      min_spend: Number(editing.min_spend ?? 0),
      max_uses: editing.max_uses ? Number(editing.max_uses) : null,
      active: editing.active ?? true,
      expires_at: editing.expires_at || null,
    };

    if (isNew) {
      const { data: existing } = await supabase.from("coupons").select("id").eq("code", payload.code).single();
      if (existing) { toast.error(`Code "${payload.code}" already exists`); setSaving(false); return; }
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error("Create failed: " + error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "CREATE_COUPON", "coupons", payload.code, null, payload);
      toast.success(`Coupon ${payload.code} created`);
    } else {
      const old = coupons.find((c) => c.id === editing.id);
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id!);
      if (error) { toast.error("Update failed: " + error.message); setSaving(false); return; }
      await logAudit(user.id, profile.email, "UPDATE_COUPON", "coupons", editing.id!, old, payload);
      toast.success(`Coupon ${payload.code} updated`);
    }

    setSaving(false);
    setEditing(null);
    load();
  };

  const del = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return;
    if (!user || !profile) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) { toast.error("Delete failed: " + error.message); return; }
    await logAudit(user.id, profile.email, "DELETE_COUPON", "coupons", c.id, c, null);
    toast.success("Coupon deleted");
    load();
  };

  const toggle = async (c: Coupon) => {
    if (!user || !profile) return;
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) { toast.error("Toggle failed: " + error.message); return; }
    await logAudit(user.id, profile.email, c.active ? "DEACTIVATE_COUPON" : "ACTIVATE_COUPON",
      "coupons", c.id, { active: c.active }, { active: !c.active });
    toast.success(`Coupon ${c.active ? "deactivated" : "activated"}`);
    setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, active: !c.active } : x));
  };

  const isExpired = (c: Coupon) => c.expires_at ? new Date(c.expires_at) < new Date() : false;
  const isMaxed = (c: Coupon) => c.max_uses !== null && c.used_count >= c.max_uses;

  const inputCls = "input";

  return (
    <div className={`flex gap-4 ${editing ? "items-start" : "flex-col"} pb-12`}>
      {/* ── List ── */}
      <div className={`flex flex-col transition-all ${editing ? "w-full lg:w-[55%]" : "w-full"}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Coupons</h1>
            <span className="badge bg-[#2a2d3a] text-gray-400">{coupons.length}</span>
          </div>
          <button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> Create Coupon
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className={`panel overflow-x-auto ${editing ? "max-h-[calc(100vh-140px)] overflow-y-auto" : ""}`}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#161920]">
                <tr className="border-b border-[#2a2d3a]">
                  {["Code", "Discount", "Min Spend", "Usage", "Expiry", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-600">No coupons yet.</td></tr>
                )}
                {coupons.map((c) => {
                  const expired = isExpired(c);
                  const maxed = isMaxed(c);
                  const effective = c.active && !expired && !maxed;
                  return (
                    <tr key={c.id} className={`table-row ${editing?.id === c.id ? "bg-gold/5" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                          <span className="font-mono font-bold text-white">{c.code}</span>
                          <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copied"); }}
                            className="text-gray-600 hover:text-gold">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {c.min_spend > 0 ? `₹${c.min_spend.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : " uses"}
                        {maxed && <span className="ml-1 text-red-400 text-[10px]">(maxed)</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {c.expires_at
                          ? <span className={expired ? "text-red-400" : ""}>
                            {new Date(c.expires_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                            {expired && " (expired)"}
                          </span>
                          : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggle(c)} className="flex items-center gap-1.5">
                          {effective
                            ? <><ToggleRight className="h-5 w-5 text-emerald-400" /><span className="text-[10px] text-emerald-400">Active</span></>
                            : <><ToggleLeft className="h-5 w-5 text-gray-600" /><span className="text-[10px] text-gray-600">{expired ? "Expired" : maxed ? "Maxed" : "Off"}</span></>
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditing({ ...c }); setIsNew(false); }}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-[#2a2d3a] hover:text-white">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => del(c)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-500/15 hover:text-red-400">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Panel ── */}
      {editing && (
        <div className="w-full lg:w-[45%] sticky top-0 max-h-[calc(100vh-48px)] overflow-y-auto pb-10">
          <div className="panel">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2d3a] bg-[#161920] px-5 py-4">
              <p className="font-semibold text-white">{isNew ? "✦ New Coupon" : `Edit: ${editing.code}`}</p>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 hover:bg-[#2a2d3a]">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="label">Code *</label>
                <input value={editing.code ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, code: e.target.value.toUpperCase() } : p)}
                  placeholder="PEHNAV20" className={inputCls} />
                <p className="mt-1 text-[10px] text-gray-600">Auto-uppercased. No spaces.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Discount Type *</label>
                  <select value={editing.type ?? "percent"}
                    onChange={(e) => setEditing((p) => p ? { ...p, type: e.target.value as any } : p)}
                    className="select">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Value *</label>
                  <input type="number" min={1} max={editing.type === "percent" ? 100 : undefined}
                    value={editing.value ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, value: Number(e.target.value) } : p)}
                    placeholder={editing.type === "percent" ? "10" : "200"} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Min Spend (₹)</label>
                  <input type="number" min={0} value={editing.min_spend ?? 0}
                    onChange={(e) => setEditing((p) => p ? { ...p, min_spend: Number(e.target.value) } : p)}
                    placeholder="0 = no minimum" className={inputCls} />
                </div>
                <div>
                  <label className="label">Max Uses</label>
                  <input type="number" min={1} value={editing.max_uses ?? ""}
                    onChange={(e) => setEditing((p) => p ? { ...p, max_uses: e.target.value ? Number(e.target.value) : null } : p)}
                    placeholder="Blank = unlimited" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="label">Expiry Date</label>
                <input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ""}
                  onChange={(e) => setEditing((p) => p ? { ...p, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null } : p)}
                  className={inputCls} />
                <p className="mt-1 text-[10px] text-gray-600">Leave blank for no expiry.</p>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" checked={editing.active ?? true}
                  onChange={(e) => setEditing((p) => p ? { ...p, active: e.target.checked } : p)}
                  className="h-4 w-4 rounded accent-gold" />
                <span className="text-sm text-gray-300">Active (usable at checkout)</span>
              </label>

              {/* Preview */}
              {editing.value && editing.code && (
                <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 text-xs">
                  <p className="text-gold font-semibold mb-1">Preview</p>
                  <p className="text-gray-400">
                    Code <strong className="text-white">{editing.code.toUpperCase()}</strong> gives{" "}
                    <strong className="text-white">
                      {editing.type === "percent" ? `${editing.value}% off` : `₹${editing.value} off`}
                    </strong>
                    {(editing.min_spend ?? 0) > 0 && ` on orders above ₹${editing.min_spend}`}
                    {editing.max_uses && `, up to ${editing.max_uses} uses`}
                    {editing.expires_at && `, expires ${new Date(editing.expires_at).toLocaleDateString("en-IN")}`}
                    .
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : isNew ? "Create Coupon" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
