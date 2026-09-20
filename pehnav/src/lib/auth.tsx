import {
  createContext, useContext, useEffect, useState,
  useCallback, useRef, type ReactNode,
} from "react";
import { supabase, type DBProfile } from "./supabase";

// ── Security constants ────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
const STORAGE_KEY_ATTEMPTS = "pehnav_admin_attempts";
const STORAGE_KEY_LOCKOUT  = "pehnav_admin_lockout";

export type Profile = DBProfile;

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
    await supabase.from("admin_audit_log").insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action,
      table_name: tableName,
      record_id: recordId,
      old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
    });
  } catch (err) {
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
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Customer auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: { full_name?: string; phone?: string }) => Promise<{ error: string | null }>;
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
      if (lockout && Date.now() < Number(lockout)) return MAX_LOGIN_ATTEMPTS;
      return Number(localStorage.getItem(STORAGE_KEY_ATTEMPTS) ?? "0");
    } catch { return 0; }
  });

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const resetInactivity = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    if (user) {
      inactivityTimer.current = setTimeout(() => { signOut(); }, INACTIVITY_TIMEOUT_MS);
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

  const fetchProfile = async (userId: string, userMeta?: Record<string, any>, userEmail?: string): Promise<Profile | null> => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (!error && data) return data as Profile;

    // Auto-create/sync profile from user session metadata (especially Google OAuth)
    if (userEmail) {
      const fallbackName = userMeta?.full_name || userMeta?.name || userEmail.split("@")[0];
      const avatarUrl = userMeta?.avatar_url || userMeta?.picture || null;
      try {
        const { data: newProf } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            email: userEmail,
            full_name: fallbackName,
            avatar_url: avatarUrl,
          })
          .select()
          .single();
        if (newProf) return newProf as Profile;
      } catch {}
    }
    return null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const prof = await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
        setUser({ id: session.user.id, email: session.user.email! });
        setProfile(prof);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const prof = await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
        setUser({ id: session.user.id, email: session.user.email! });
        setProfile(prof);
        setLoginError("");
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

  // Admin sign in (strict role check)
  const signIn = async (email: string, password: string) => {
    setLoginError("");
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
  };

  const signOut = async () => {
    clearTimeout(inactivityTimer.current);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Customer auth methods
  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        return { error: error.message };
      }
      if (data?.url) {
        window.location.href = data.url;
      }
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? "Failed to initialize Google login" };
    }
  };

  const signInWithOtp = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error?.message ?? null };
  };

  const verifyOtp = async (email: string, token: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (updates: { full_name?: string; phone?: string }): Promise<{ error: string | null }> => {
    if (!user) return { error: "Not logged in" };
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...updates });
    if (!error) {
      const prof = await fetchProfile(user.id);
      setProfile(prof);
    }
    return { error: error?.message ?? null };
  };

  const isAdmin = profile?.role === "admin";

  return (
    <Ctx.Provider value={{
      user, profile, loading, loginError, loginAttempts, isAdmin,
      signIn, signOut,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithOtp, verifyOtp, updateProfile,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
