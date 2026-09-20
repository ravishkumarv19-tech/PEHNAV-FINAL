import { useState } from "react";
import { Loader2, Zap, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { signIn, loginError, loginAttempts } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const MAX_ATTEMPTS = 5;
  const locked = loginAttempts >= MAX_ATTEMPTS;

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || locked) return;
    setLoading(true);
    await signIn(email.trim(), password);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#BFA16A]">
            <Zap className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white">PEHNAV</h1>
          <p className="mt-1 text-xs text-gray-600 tracking-wider uppercase">Admin Panel</p>
        </div>

        <div className="panel p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="admin@pehnav.com"
              className="input"
              autoComplete="email"
              disabled={locked}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="input pr-10"
                autoComplete="current-password"
                disabled={locked}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {loginError && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400">
              <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Locked */}
          {locked && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400">
              <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>Too many failed attempts. Please wait 15 minutes before trying again.</span>
            </div>
          )}

          {/* Attempts warning */}
          {loginAttempts > 0 && !locked && (
            <p className="text-center text-[10px] text-amber-500">
              {MAX_ATTEMPTS - loginAttempts} attempt{MAX_ATTEMPTS - loginAttempts !== 1 ? "s" : ""} remaining
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || locked || !email || !password}
            className="btn-primary w-full justify-center py-3"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] text-gray-700">
          This panel is restricted to authorized PEHNAV admins only.
        </p>
      </div>
    </div>
  );
}
