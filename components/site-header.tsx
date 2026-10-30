"use client";

import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import type { AppRole } from "@/lib/auth";

type SiteHeaderProps = {
  email?: string | null;
  roles?: AppRole[];
  unreadNotifications?: number;
};

export function SiteHeader({
  email,
  roles = [],
  unreadNotifications = 0,
}: SiteHeaderProps) {
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
          <Link href="/jobs" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            {copy.modules.farmJobs.title}
          </Link>
          <Link href="/crops" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            {copy.modules.cropMarketplace.title}
          </Link>
          <Link href="/buyers" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            {copy.modules.buyersTraders.title}
          </Link>
          <Link href="/agri-mitra" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            {copy.agriMitra}
          </Link>
          {email ? (
            <>
              <Link href="/bookings" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                {copy.bookings}
              </Link>
              {roles.includes("farmer") ? (
                <>
                  <Link href="/farmer/jobs" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                    My jobs
                  </Link>
                  <Link href="/seller/crops" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                    My crops
                  </Link>
                </>
              ) : null}
              {roles.includes("buyer") ||
              roles.includes("retailer") ||
              roles.includes("farmer") ? (
                <Link href="/buyer/deals" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                  Crop deals
                </Link>
              ) : null}
              {roles.includes("buyer") || roles.includes("retailer") ? (
                <>
                  <Link
                    href="/buyer/requirements"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    My requirements
                  </Link>
                  <Link
                    href="/buyer/profile"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    Buyer profile
                  </Link>
                </>
              ) : null}
              {roles.includes("worker") || roles.includes("labour_contractor") ? (
                <>
                  <Link
                    href="/worker/applications"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    Applications
                  </Link>
                  <Link
                    href="/worker/profile"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    Worker profile
                  </Link>
                </>
              ) : null}
              <Link href="/messages" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                {copy.messages}
              </Link>
              <Link
                href="/notifications"
                className="relative rounded-md px-2 py-1 hover:bg-accent-soft"
              >
                {copy.notifications}
                {unreadNotifications > 0 ? (
                  <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                ) : null}
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
                <Link href="/admin" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                  Admin
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
