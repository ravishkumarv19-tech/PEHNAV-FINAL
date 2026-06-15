// PEHNAV error reporting — clean, no third-party traces

type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorOptions = {},
) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error("[PEHNAV Error]", error, context);
  }

  // In production: send to your own logging endpoint or Supabase
  if (import.meta.env.PROD) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) return;

    // Non-blocking fire-and-forget error log
    fetch(`${supabaseUrl}/functions/v1/log-error`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context,
        options,
        url: typeof window !== "undefined" ? window.location.pathname : "",
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {}); // Never let error reporting crash the app
  }
}
