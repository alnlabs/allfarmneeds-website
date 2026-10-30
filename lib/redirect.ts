import type { AppRole } from "@/lib/auth";

const FALLBACK = "/profile";

export function safeInternalPath(next: string | null | undefined) {
  if (!next) return FALLBACK;
  if (!next.startsWith("/") || next.startsWith("//")) return FALLBACK;
  if (next.startsWith("/login")) return FALLBACK;
  return next;
}

/** True when next was missing or the old services default — use role-aware landing. */
export function isGenericNext(next: string | null | undefined) {
  const path = safeInternalPath(next);
  return path === FALLBACK || path === "/services" || path === "/";
}

export function pathAfterRoles(roles: AppRole[], next?: string | null) {
  const requested = safeInternalPath(next);
  if (!isGenericNext(next)) {
    return requested;
  }

  if (roles.includes("service_provider")) {
    return `/provider/profile?next=${encodeURIComponent("/create")}`;
  }
  if (roles.includes("worker") || roles.includes("labour_contractor")) {
    return `/worker/profile?next=${encodeURIComponent("/jobs")}`;
  }
  if (roles.includes("buyer") || roles.includes("retailer")) {
    return `/buyer/profile?next=${encodeURIComponent("/buyers/new")}`;
  }
  if (roles.includes("farmer")) {
    return "/profile?welcome=1";
  }
  return "/profile?welcome=1";
}
