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

function BottomNavInner({ signedIn = false }: SiteBottomNavProps) {
  const pathname = usePathname();
  const { copy } = useLocale();

  const items = [
    { href: "/", label: copy.navHome, match: (path: string) => path === "/" },
    {
      href: "/explore",
      label: copy.navExplore,
      match: (path: string) => path.startsWith("/explore"),
    },
    {
      href: signedIn ? "/create" : "/login?next=/create",
      label: copy.navCreate,
      match: (path: string) => path.startsWith("/create"),
    },
    {
      href: signedIn ? "/messages" : "/login?next=/messages",
      label: copy.navMessages,
      match: (path: string) => path.startsWith("/messages"),
    },
    {
      href: signedIn ? "/profile" : "/login?next=/profile",
      label: copy.navProfile,
      match: (path: string) => path.startsWith("/profile"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={copy.navHome}
    >
      <div className="mx-auto flex w-full max-w-7xl items-stretch">
        {items.map((item) => (
          <NavItem
            key={item.label}
            href={item.href}
            label={item.label}
            active={item.match(pathname)}
          />
        ))}
      </div>
    </nav>
  );
}

function BottomNavFallback({ signedIn = false }: SiteBottomNavProps) {
  const { copy } = useLocale();
  const items = [
    { href: "/", label: copy.navHome },
    { href: "/explore", label: copy.navExplore },
    {
      href: signedIn ? "/create" : "/login?next=/create",
      label: copy.navCreate,
    },
    {
      href: signedIn ? "/messages" : "/login?next=/messages",
      label: copy.navMessages,
    },
    {
      href: signedIn ? "/profile" : "/login?next=/profile",
      label: copy.navProfile,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={copy.navHome}
    >
      <div className="mx-auto flex w-full max-w-7xl items-stretch">
        {items.map((item) => (
          <NavItem
            key={item.label}
            href={item.href}
            label={item.label}
            active={false}
          />
        ))}
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
