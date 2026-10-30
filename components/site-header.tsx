"use client";

import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import type { AppRole } from "@/lib/auth";

type SiteHeaderProps = {
  email?: string | null;
  roles?: AppRole[];
};

export function SiteHeader({ email, roles = [] }: SiteHeaderProps) {
  const { copy } = useLocale();
  const isProvider = roles.includes("service_provider");
  const isStaff =
    roles.includes("administrator") || roles.includes("moderator");

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-accent-strong">
            AllFarmNeeds
          </Link>
          <p className="text-sm text-muted">{copy.tagline}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <LanguageSwitcher />
          <Link href="/services" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            {copy.farmServices}
          </Link>
          {email ? (
            <>
              <Link href="/bookings" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                {copy.bookings}
              </Link>
              <Link href="/messages" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                {copy.messages}
              </Link>
              {isProvider ? (
                <>
                  <Link
                    href="/provider/listings"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    {copy.myListings}
                  </Link>
                  <Link
                    href="/provider/bookings"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    {copy.providerBookings}
                  </Link>
                  <Link
                    href="/provider/profile"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    {copy.providerProfile}
                  </Link>
                </>
              ) : null}
              {isStaff ? (
                <Link
                  href="/admin/listings"
                  className="rounded-md px-2 py-1 hover:bg-accent-soft"
                >
                  {copy.moderation}
                </Link>
              ) : null}
              <Link
                href="/onboarding/roles"
                className="rounded-md px-2 py-1 hover:bg-accent-soft"
              >
                {copy.roles}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-accent-soft"
                >
                  {copy.signOut}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.signIn}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
