import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from "react";
import { supabase, type Profile } from "./supabase";

// ── Security constants ────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;      // 15 minutes
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;    // 60 minutes
const STORAGE_KEY_ATTEMPTS = "pehnav_admin_attempts";
const STORAGE_KEY_LOCKOUT  = "pehnav_admin_lockout";

// ── logAudit (exported standalone for use in routes) ─────────────────────────
export async function logAudit(
  adminId: string,
  adminEmail: string,
  action: string,
  tableName: string,
  recordId: string,
  oldValue: unknown,
  newValue: unknown,
) {
  try {
    await supabase.from("audit_log").insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action,
      table_name: tableName,
      record_id: recordId,
      old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
    });
  } catch (err) {
    // Never let audit failure block the main operation
    console.error("Audit log failed:", err);
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AuthCtx {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  loginError: string;
  loginAttempts: number;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(() => {
    try {
      const lockout = localStorage.getItem(STORAGE_KEY_LOCKOUT);
      if (lockout && Date.now() < Number(lockout)) {
        return MAX_LOGIN_ATTEMPTS; // still locked out
      }
      return Number(localStorage.getItem(STORAGE_KEY_ATTEMPTS) ?? "0");
    } catch { return 0; }
  });

  const inactivityTimer = useRef<ReturnType<typeof setTimeout>>();

  // Reset inactivity timer on user activity
  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (user) {
      inactivityTimer.current = setTimeout(() => {
        signOut();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
      events.forEach((e) => window.addEventListener(e, resetInactivity, { passive: true }));
      resetInactivity();
      return () => {
        events.forEach((e) => window.removeEventListener(e, resetInactivity));
        clearTimeout(inactivityTimer.current);
      };
    }
  }, [user, resetInactivity]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return data as Profile;
  };

  // Initialize auth state
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id);
        if (!prof || prof.role !== "admin") {
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
        setUser({ id: session.user.id, email: session.user.email! });
        setProfile(prof);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const prof = await fetchProfile(session.user.id);
        if (!prof || prof.role !== "admin") {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoginError("Access denied. You are not an authorized admin.");
          return;
        }
        setUser({ id: session.user.id, email: session.user.email! });
        setProfile(prof);
        setLoginError("");
        // Reset attempts on successful login
        localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEY_LOCKOUT);
        setLoginAttempts(0);
      }
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoginError("");

    // Check lockout
    try {
      const lockoutUntil = Number(localStorage.getItem(STORAGE_KEY_LOCKOUT) ?? "0");
      if (Date.now() < lockoutUntil) {
        const mins = Math.ceil((lockoutUntil - Date.now()) / 60000);
        setLoginError(`Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`);
        return;
      }
    } catch {}

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      try {
        localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(newAttempts));
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          localStorage.setItem(STORAGE_KEY_LOCKOUT, String(Date.now() + LOCKOUT_DURATION_MS));
          setLoginError("Too many failed attempts. Locked for 15 minutes.");
        } else {
          setLoginError(
            error.message.includes("Invalid")
              ? `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempt${MAX_LOGIN_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining.`
              : error.message
          );
        }
      } catch {}
    }
    // Success handled by onAuthStateChange
  };

  const signOut = async () => {
    clearTimeout(inactivityTimer.current);
    await logAudit(
      user?.id ?? "unknown",
      user?.email ?? "unknown",
      "ADMIN_LOGOUT",
      "auth",
      user?.id ?? "unknown",
      null,
      null,
    ).catch(() => {});
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <Ctx.Provider value={{ user, profile, loading, loginError, loginAttempts, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
