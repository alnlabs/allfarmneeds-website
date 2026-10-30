"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hide global chrome on the Stitch homepage (it brings its own). */
export function HomeChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return children;
}
