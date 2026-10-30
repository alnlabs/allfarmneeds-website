const FALLBACK = "/services";

export function safeInternalPath(next: string | null | undefined) {
  if (!next) return FALLBACK;
  if (!next.startsWith("/") || next.startsWith("//")) return FALLBACK;
  if (next.startsWith("/login")) return FALLBACK;
  return next;
}
