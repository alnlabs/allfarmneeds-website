"use client";

import type { ReactNode } from "react";

/** Mobile: collapsible filters. Desktop: always-visible panel. */
export function FilterPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <details className="group rounded-2xl border border-border bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium marker:content-none">
          <span>{title}</span>
          <span className="text-sm text-muted">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="border-t border-border px-4 py-4">{children}</div>
      </details>
      <section className="hidden rounded-2xl border border-border bg-white p-5 lg:block">
        <h2 className="mb-4 text-sm font-medium">{title}</h2>
        {children}
      </section>
    </>
  );
}
