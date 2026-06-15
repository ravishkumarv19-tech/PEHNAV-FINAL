import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  // Clear error after 6 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    setLoading(false);
    if (error) {
      setAttempts((n) => n + 1);
      setError(error);
      // Deliberately slow down the UI on failures — adds friction to bots
      await new Promise((r) => setTimeout(r, 800 * Math.min(attempts + 1, 5)));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0c12] px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#161920] border border-[#2a2d3a]">
            <Lock className="h-5 w-5 text-gold" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Authorised personnel only
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@yourdomain.com"
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass
                  ? <EyeOff className="h-4 w-4" />
                  : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
              : "Sign In"}
          </button>
        </form>

        {/* Security note */}
        <p className="mt-8 text-center text-xs text-gray-600">
          All access attempts are logged and monitored.
          Unauthorised access is a criminal offence.
        </p>
      </div>
    </div>
  );
}
