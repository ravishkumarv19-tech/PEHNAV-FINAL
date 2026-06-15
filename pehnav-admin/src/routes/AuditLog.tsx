import { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
}

const ACTION_COLOR: Record<string, string> = {
  ADMIN_LOGIN: "text-emerald-400",
  ADMIN_LOGOUT: "text-gray-400",
  UPDATE_ORDER_STATUS: "text-blue-400",
  UPDATE_TRACKING: "text-cyan-400",
  REVIEW_APPROVED: "text-emerald-400",
  REVIEW_REJECTED: "text-red-400",
  UPDATE_PRODUCT: "text-yellow-400",
  CREATE_PRODUCT: "text-purple-400",
  DELETE_PRODUCT: "text-red-400",
  CREATE_COUPON: "text-gold",
  UPDATE_COUPON: "text-gold",
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setEntries((data as AuditEntry[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-5 w-5 text-gold" />
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Every admin action is permanently recorded. This log cannot be deleted.
      </p>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>
      ) : (
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2d3a]">
                {["Time", "Admin", "Action", "Table", "Record ID"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No audit entries yet.</td></tr>
              )}
              {entries.map((e) => (
                <tr key={e.id} className="table-row">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">{e.admin_email}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs font-medium ${ACTION_COLOR[e.action] ?? "text-gray-300"}`}>
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{e.table_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-mono truncate max-w-32">{e.record_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
