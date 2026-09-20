// PEHNAV error reporting
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  if (import.meta.env.DEV) {
    console.error("[PEHNAV Error]", error, context);
  }
}
