"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import type { AppRole } from "@/lib/auth";

type SiteHeaderProps = {
  email?: string | null;
  roles?: AppRole[];
  unreadNotifications?: number;
};

function NavLink({
  href,
  children,
  onClick,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm hover:bg-accent-soft ${className}`}
    >
      {children}
    </Link>
  );
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SiteHeader({
  email,
  roles = [],
  unreadNotifications = 0,
}: SiteHeaderProps) {
  const { copy, locationLabel, detecting } = useLocale();
  const [open, setOpen] = useState(false);
  const [myWorkOpen, setMyWorkOpen] = useState(false);
  const menuId = useId();
  const myWorkId = useId();
  const isProvider = roles.includes("service_provider");
  const isStaff =
    roles.includes("administrator") || roles.includes("moderator");
  const isFarmer = roles.includes("farmer");
  const isWorker =
    roles.includes("worker") || roles.includes("labour_contractor");
  const isBuyer = roles.includes("buyer") || roles.includes("retailer");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!myWorkOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMyWorkOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-my-work-menu="${myWorkId}"]`)) return;
      setMyWorkOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [myWorkOpen, myWorkId]);

  const close = () => setOpen(false);

  const primary = (
    <>
      <NavLink href="/" onClick={close}>
        {copy.navHome}
      </NavLink>
      <NavLink href="/explore" onClick={close}>
        {copy.navExplore}
      </NavLink>
      <NavLink href="/create" onClick={close}>
        {copy.navCreate}
      </NavLink>
      <NavLink href="/messages" onClick={close}>
        {copy.navMessages}
      </NavLink>
      <NavLink href="/profile" onClick={close}>
        {copy.navProfile}
        <UnreadBadge count={unreadNotifications} />
      </NavLink>
    </>
  );

  const marketplace = (
    <>
      <p className="px-3 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
        {copy.navMarketplace}
      </p>
      <NavLink href="/services" onClick={close}>
        {copy.modules.farmServices.title}
      </NavLink>
      <NavLink href="/jobs" onClick={close}>
        {copy.modules.farmJobs.title}
      </NavLink>
      <NavLink href="/crops" onClick={close}>
        {copy.modules.cropMarketplace.title}
      </NavLink>
      <NavLink href="/buyers" onClick={close}>
        {copy.modules.buyersTraders.title}
      </NavLink>
      <NavLink href="/agri-mitra" onClick={close}>
        {copy.agriMitra}
      </NavLink>
    </>
  );

  const accountLinks = (
    <>
      <NavLink href="/notifications" onClick={close}>
        {copy.notifications}
        <UnreadBadge count={unreadNotifications} />
      </NavLink>
      <NavLink href="/bookings" onClick={close}>
        {copy.bookings}
      </NavLink>
      {isFarmer ? (
        <>
          <NavLink href="/farmer/jobs" onClick={close}>
            {copy.myJobs}
          </NavLink>
          <NavLink href="/seller/crops" onClick={close}>
            {copy.myCrops}
          </NavLink>
        </>
      ) : null}
      {isFarmer || isBuyer ? (
        <NavLink href="/buyer/deals" onClick={close}>
          {copy.cropDeals}
        </NavLink>
      ) : null}
      {isBuyer ? (
        <>
          <NavLink href="/buyer/requirements" onClick={close}>
            {copy.myRequirements}
          </NavLink>
          <NavLink href="/buyer/profile" onClick={close}>
            {copy.buyerProfile}
          </NavLink>
        </>
      ) : null}
      {isWorker ? (
        <>
          <NavLink href="/worker/applications" onClick={close}>
            {copy.applications}
          </NavLink>
          <NavLink href="/worker/profile" onClick={close}>
            {copy.workerProfile}
          </NavLink>
        </>
      ) : null}
      {isProvider ? (
        <>
          <NavLink href="/provider/listings" onClick={close}>
            {copy.myListings}
          </NavLink>
          <NavLink href="/provider/bookings" onClick={close}>
            {copy.providerBookings}
          </NavLink>
          <NavLink href="/provider/profile" onClick={close}>
            {copy.providerProfile}
          </NavLink>
        </>
      ) : null}
      {isStaff ? (
        <NavLink href="/admin" onClick={close}>
          {copy.admin}
        </NavLink>
      ) : null}
      <NavLink href="/onboarding/roles" onClick={close}>
        {copy.roles}
      </NavLink>
    </>
  );

  const account = email ? (
    <>
      <p className="px-3 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
        {copy.navAccount}
      </p>
      {accountLinks}
      <form action={signOut} className="px-3 pt-2">
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-accent-soft"
        >
          {copy.signOut}
        </button>
      </form>
    </>
  ) : (
    <div className="px-3 pt-2">
      <Link
        href="/login"
        onClick={close}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
      >
        {copy.signIn}
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex w-full min-w-0 max-w-[var(--content-max)] items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="block truncate text-lg font-semibold tracking-tight text-accent-strong sm:text-xl"
          >
            AllFarmNeeds
          </Link>
          <p className="hidden truncate text-xs text-muted sm:block">
            {copy.tagline}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {!email ? (
            <Link
              href="/login"
              className="hidden min-h-9 items-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-strong md:inline-flex"
            >
              {copy.signIn}
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent-soft lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">
              {open ? copy.closeMenu : copy.openMenu}
            </span>
            <span className="flex w-4 flex-col gap-1" aria-hidden>
              <span className="block h-0.5 rounded bg-foreground" />
              <span className="block h-0.5 rounded bg-foreground" />
              <span className="block h-0.5 rounded bg-foreground" />
            </span>
          </button>
        </div>
      </div>

      {/* Desktop: main app nav only — marketplace via Explore */}
      <div className="hidden border-t border-border lg:block">
        <nav className="mx-auto flex w-full max-w-[var(--content-max)] items-center gap-1 px-4 py-2 sm:px-6 lg:px-8 xl:px-10">
          <NavLink href="/">{copy.navHome}</NavLink>
          <NavLink href="/explore">{copy.navExplore}</NavLink>
          <NavLink href="/create">{copy.navCreate}</NavLink>
          <NavLink href="/messages">{copy.navMessages}</NavLink>
          {email ? (
            <div className="relative" data-my-work-menu={myWorkId}>
              <button
                type="button"
                className="inline-flex items-center rounded-lg px-3 py-2 text-sm hover:bg-accent-soft"
                aria-expanded={myWorkOpen}
                aria-controls={`${myWorkId}-panel`}
                onClick={() => setMyWorkOpen((value) => !value)}
              >
                {copy.navProfile}
                <UnreadBadge count={unreadNotifications} />
              </button>
              {myWorkOpen ? (
                <div
                  id={`${myWorkId}-panel`}
                  className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-border bg-white p-2 shadow-lg"
                >
                  <NavLink
                    href="/profile"
                    onClick={() => setMyWorkOpen(false)}
                    className="block"
                  >
                    {copy.navProfile}
                  </NavLink>
                  <NavLink
                    href="/notifications"
                    onClick={() => setMyWorkOpen(false)}
                    className="block"
                  >
                    {copy.notifications}
                    <UnreadBadge count={unreadNotifications} />
                  </NavLink>
                  <NavLink
                    href="/bookings"
                    onClick={() => setMyWorkOpen(false)}
                    className="block"
                  >
                    {copy.bookings}
                  </NavLink>
                  {isFarmer ? (
                    <>
                      <NavLink
                        href="/farmer/jobs"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.myJobs}
                      </NavLink>
                      <NavLink
                        href="/seller/crops"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.myCrops}
                      </NavLink>
                    </>
                  ) : null}
                  {isFarmer || isBuyer ? (
                    <NavLink
                      href="/buyer/deals"
                      onClick={() => setMyWorkOpen(false)}
                      className="block"
                    >
                      {copy.cropDeals}
                    </NavLink>
                  ) : null}
                  {isBuyer ? (
                    <>
                      <NavLink
                        href="/buyer/requirements"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.myRequirements}
                      </NavLink>
                      <NavLink
                        href="/buyer/profile"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.buyerProfile}
                      </NavLink>
                    </>
                  ) : null}
                  {isWorker ? (
                    <>
                      <NavLink
                        href="/worker/applications"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.applications}
                      </NavLink>
                      <NavLink
                        href="/worker/profile"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.workerProfile}
                      </NavLink>
                    </>
                  ) : null}
                  {isProvider ? (
                    <>
                      <NavLink
                        href="/provider/listings"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.myListings}
                      </NavLink>
                      <NavLink
                        href="/provider/bookings"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.providerBookings}
                      </NavLink>
                      <NavLink
                        href="/provider/profile"
                        onClick={() => setMyWorkOpen(false)}
                        className="block"
                      >
                        {copy.providerProfile}
                      </NavLink>
                    </>
                  ) : null}
                  {isStaff ? (
                    <NavLink
                      href="/admin"
                      onClick={() => setMyWorkOpen(false)}
                      className="block"
                    >
                      {copy.admin}
                    </NavLink>
                  ) : null}
                  <NavLink
                    href="/onboarding/roles"
                    onClick={() => setMyWorkOpen(false)}
                    className="block"
                  >
                    {copy.roles}
                  </NavLink>
                  <form action={signOut} className="px-1 pt-1">
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-accent-soft"
                    >
                      {copy.signOut}
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ) : (
            <NavLink href="/login">{copy.signIn}</NavLink>
          )}
        </nav>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label={copy.closeMenu}
            onClick={close}
          />
          <div
            id={menuId}
            className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col overflow-y-auto border-l border-border bg-white shadow-lg"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold text-accent-strong">{copy.menu}</p>
                <p className="truncate text-xs text-muted">
                  {detecting
                    ? copy.detectingLocation
                    : locationLabel
                      ? `${copy.nearYou}: ${locationLabel}`
                      : copy.locationUnknown}
                </p>
              </div>
              <button
                type="button"
                className="min-h-10 shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
                onClick={close}
              >
                {copy.close}
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 py-3 pb-24">
              {primary}
              {marketplace}
              {account}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
