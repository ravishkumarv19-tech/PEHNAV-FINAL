import {
  createContext, useContext, useEffect, useRef,
  useState, type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, type Profile } from "./supabase";

// ─── Security config ──────────────────────────────────────────────────────────
// Emails that are EVER allowed to log into this admin panel.
// Even if someone gets a Supabase token, they can't access admin
// unless their email is in this list AND their DB role is 'admin'.
const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

// Auto sign-out after 2 hours of inactivity
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;

// Max failed login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

// ─── Audit logger ─────────────────────────────────────────────────────────────
export async function logAudit(
  adminId: string,
  adminEmail: string,
  action: string,
  tableName: string,
  recordId?: string | null,
  oldValue?: object | null,
  newValue?: object | null,
) {
  await supabase.from("admin_audit_log").insert({
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    table_name: tableName,
    record_id: recordId ?? null,
    old_value: oldValue ?? null,
    new_value: newValue ?? null,
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Inactivity timer
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Brute-force protection (in-memory — resets on page reload, intentionally)
  const loginAttempts = useRef<{ count: number; lockedUntil: number }>({
    count: 0,
    lockedUntil: 0,
  });

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      supabase.auth.signOut();
    }, INACTIVITY_TIMEOUT_MS);
  };

  // Listen for user activity
  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handle = () => { if (user) resetInactivityTimer(); };
    events.forEach((e) => window.addEventListener(e, handle, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handle));
  }, [user]);

  // Boot — load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) verifyAndSet(session);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) await verifyAndSet(session);
        else {
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Multi-layer verification ───────────────────────────────────────────────
  async function verifyAndSet(session: Session) {
    const email = session.user.email?.toLowerCase() ?? "";

    // Layer 1 — Email allowlist check (fastest, no DB call needed)
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Layer 2 — Database role check
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!prof || prof.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Layer 3 — Log the access
    await logAudit(
      session.user.id,
      email,
      "ADMIN_LOGIN",
      "auth",
      session.user.id,
    );

    setSession(session);
    setUser(session.user);
    setProfile(prof as Profile);
    setLoading(false);
    resetInactivityTimer();
  }

  // ── Sign in with brute-force protection ───────────────────────────────────
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const now = Date.now();
    const attempts = loginAttempts.current;

    // Check lockout
    if (attempts.lockedUntil > now) {
      const mins = Math.ceil((attempts.lockedUntil - now) / 60000);
      return { error: `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.` };
    }

    // Email allowlist pre-check — don't even hit Supabase
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email.toLowerCase())) {
      // Intentionally vague — don't reveal which emails are allowed
      loginAttempts.current.count += 1;
      return { error: "Invalid credentials." };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      attempts.count += 1;
      if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        attempts.lockedUntil = now + LOCKOUT_DURATION_MS;
        attempts.count = 0;
        return { error: "Account locked for 15 minutes due to too many failed attempts." };
      }
      const remaining = MAX_LOGIN_ATTEMPTS - attempts.count;
      return { error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
    }

    // Success — reset counter
    loginAttempts.current = { count: 0, lockedUntil: 0 };
    return { error: null };
  };

  const signOut = async () => {
    if (user && profile) {
      await logAudit(user.id, profile.email, "ADMIN_LOGOUT", "auth", user.id);
    }
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, profile, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
