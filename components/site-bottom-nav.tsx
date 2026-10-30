"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

type SiteBottomNavProps = {
  signedIn?: boolean;
};

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center text-[11px] font-medium leading-tight sm:text-xs ${
        active ? "text-accent-strong" : "text-muted"
      }`}
    >
      <span
        className={`h-1 w-6 rounded-full ${active ? "bg-accent" : "bg-transparent"}`}
        aria-hidden
      />
      <span className="line-clamp-2 w-full">{label}</span>
    </Link>
  );
}

function CreateFab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-mt-3 flex min-w-0 flex-1 flex-col items-center justify-end gap-0.5 px-1 text-center"
      aria-label={label}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl font-semibold leading-none text-white shadow-md hover:bg-accent-strong">
        +
      </span>
      <span className="line-clamp-1 w-full text-[11px] font-medium text-accent-strong sm:text-xs">
        {label}
      </span>
    </Link>
  );
}

function useMarketplaceItems(signedIn: boolean) {
  const { copy } = useLocale();
  const createHref = signedIn ? "/create" : "/login?next=/create";
  return [
    {
      href: "/explore",
      label: copy.navExplore,
      match: (path: string) => path.startsWith("/explore") || path === "/",
      kind: "link" as const,
    },
    {
      href: "/services",
      label: copy.navServices,
      match: (path: string) => path.startsWith("/services"),
      kind: "link" as const,
    },
    {
      href: createHref,
      label: copy.navCreate,
      match: (path: string) => path.startsWith("/create"),
      kind: "create" as const,
    },
    {
      href: "/crops",
      label: copy.navSell,
      match: (path: string) => path.startsWith("/crops"),
      kind: "link" as const,
    },
    {
      href: "/agri-mitra",
      label: copy.navAgriMitraShort,
      match: (path: string) => path.startsWith("/agri-mitra"),
      kind: "link" as const,
    },
  ];
}

function BottomNavInner({ signedIn = false }: SiteBottomNavProps) {
  const pathname = usePathname();
  const { copy } = useLocale();
  const items = useMarketplaceItems(signedIn);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={copy.navMarketplace}
    >
      <div className="mx-auto flex w-full max-w-[var(--content-max)] items-stretch">
        {items.map((item) =>
          item.kind === "create" ? (
            <CreateFab key={item.href} href={item.href} label={item.label} />
          ) : (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={item.match(pathname)}
            />
          ),
        )}
      </div>
    </nav>
  );
}

function BottomNavFallback({ signedIn = false }: SiteBottomNavProps) {
  const { copy } = useLocale();
  const items = useMarketplaceItems(signedIn);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={copy.navMarketplace}
    >
      <div className="mx-auto flex w-full max-w-[var(--content-max)] items-stretch">
        {items.map((item) =>
          item.kind === "create" ? (
            <CreateFab key={item.href} href={item.href} label={item.label} />
          ) : (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              active={false}
            />
          ),
        )}
      </div>
    </nav>
  );
}

export function SiteBottomNav({ signedIn = false }: SiteBottomNavProps) {
  return (
    <Suspense fallback={<BottomNavFallback signedIn={signedIn} />}>
      <BottomNavInner signedIn={signedIn} />
    </Suspense>
  );
}
