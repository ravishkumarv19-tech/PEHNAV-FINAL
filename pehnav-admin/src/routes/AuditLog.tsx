import { useEffect, useState } from "react";
import { Search, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { supabase, type AuditLog } from "@/lib/supabase";
import { toast } from "sonner";

const PAGE_SIZE = 30;

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-500/15 text-emerald-400",
  UPDATE: "bg-blue-500/15 text-blue-400",
  DELETE: "bg-red-500/15 text-red-400",
  BAN: "bg-orange-500/15 text-orange-400",
  UNBAN: "bg-cyan-500/15 text-cyan-400",
  APPROVE: "bg-emerald-500/15 text-emerald-400",
  REJECT: "bg-red-500/15 text-red-400",
  DEACTIVATE: "bg-gray-500/15 text-gray-400",
  ACTIVATE: "bg-emerald-500/15 text-emerald-400",
};

function actionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.startsWith(k));
  return key ? ACTION_COLORS[key] : "bg-[#2a2d3a] text-gray-400";
}

function JsonDiff({ old_value, new_value }: { old_value: any; new_value: any }) {
  if (!old_value && !new_value) return null;
  const allKeys = new Set([
    ...Object.keys(old_value ?? {}),
    ...Object.keys(new_value ?? {}),
  ]);

  const changedKeys = [...allKeys].filter(
    (k) => JSON.stringify((old_value ?? {})[k]) !== JSON.stringify((new_value ?? {})[k])
  );

  if (changedKeys.length === 0 && !(!old_value || !new_value)) {
    return <p className="text-[10px] text-gray-600">No field-level changes detected.</p>;
  }

  return (
    <div className="space-y-1 text-[10px] font-mono">
      {(old_value === null && new_value) && (
        <p className="text-emerald-400">+ Created: {JSON.stringify(new_value).slice(0, 200)}</p>
      )}
      {(new_value === null && old_value) && (
        <p className="text-red-400">− Deleted: {JSON.stringify(old_value).slice(0, 200)}</p>
      )}
      {changedKeys.map((k) => (
        <div key={k}>
          {old_value?.[k] !== undefined && (
            <p className="text-red-400">− {k}: {JSON.stringify(old_value[k])}</p>
          )}
          {new_value?.[k] !== undefined && (
            <p className="text-emerald-400">+ {k}: {JSON.stringify(new_value[k])}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      let q = supabase
        .from("admin_audit_log")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

      if (search.trim()) q = q.or(`admin_email.ilike.%${search}%,record_id.ilike.%${search}%,action.ilike.%${search}%`);
      if (actionFilter !== "all") q = q.ilike("action", `${actionFilter}%`);
      if (tableFilter !== "all") q = q.eq("table_name", tableFilter);

      const { data, error, count } = await q;
      if (error) throw error;
      setLogs((data as AuditLog[]) ?? []);
      setTotal(count ?? 0);
    } catch (err: any) {
      toast.error("Failed to load audit log: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(0); load(0); }, [search, actionFilter, tableFilter]);
  useEffect(() => { load(); }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TABLES = ["all", "products", "orders", "coupons", "profiles", "reviews"];
  const ACTIONS = ["all", "CREATE", "UPDATE", "DELETE", "BAN", "UNBAN", "APPROVE", "REJECT", "ACTIVATE", "DEACTIVATE"];

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-xs text-gray-500">{total} total events</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin, record, action…" className="input pl-9 w-56" />
          </div>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="select w-auto">
            {ACTIONS.map((a) => <option key={a} value={a}>{a === "all" ? "All actions" : a}</option>)}
          </select>
          <select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)} className="select w-auto">
            {TABLES.map((t) => <option key={t} value={t}>{t === "all" ? "All tables" : t}</option>)}
          </select>
        </div>
      </div>

      <div className="panel overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#161920]">
              <tr className="border-b border-[#2a2d3a]">
                {["", "Action", "Table", "Record", "Admin", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-600">No audit events found.</td></tr>
              )}
              {logs.map((log) => (
                <>
                  <tr key={log.id}
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    className="table-row cursor-pointer">
                    <td className="px-3 py-3 text-gray-600">
                      {expanded === log.id
                        ? <ChevronDown className="h-3.5 w-3.5" />
                        : <ChevronRight className="h-3.5 w-3.5" />}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${actionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.table_name}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400 max-w-[120px] truncate">{log.record_id ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-[160px]">{log.admin_email}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-600 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={log.id + "_exp"} className="bg-[#0f1117]">
                      <td colSpan={6} className="px-8 py-3">
                        <JsonDiff old_value={log.old_value} new_value={log.new_value} />
                        {log.ip_address && (
                          <p className="mt-1 text-[10px] text-gray-600">IP: {log.ip_address}</p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">← Prev</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`px-2.5 py-1 rounded text-xs ${page === i ? "bg-gold text-black font-bold" : "text-gray-500 hover:text-white"}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}