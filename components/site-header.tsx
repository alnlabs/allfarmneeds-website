import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { AppRole } from "@/lib/auth";

type SiteHeaderProps = {
  email?: string | null;
  roles?: AppRole[];
};

export function SiteHeader({ email, roles = [] }: SiteHeaderProps) {
  const isProvider = roles.includes("service_provider");
  const isStaff =
    roles.includes("administrator") || roles.includes("moderator");

  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-accent-strong">
            AllFarmNeeds
          </Link>
          <p className="text-sm text-muted">Everything farmers need. One platform.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/services" className="rounded-md px-2 py-1 hover:bg-accent-soft">
            Farm Services
          </Link>
          {email ? (
            <>
              <Link href="/bookings" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                Bookings
              </Link>
              <Link href="/messages" className="rounded-md px-2 py-1 hover:bg-accent-soft">
                Messages
              </Link>
              {isProvider ? (
                <>
                  <Link
                    href="/provider/listings"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    My listings
                  </Link>
                  <Link
                    href="/provider/bookings"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    Provider bookings
                  </Link>
                  <Link
                    href="/provider/profile"
                    className="rounded-md px-2 py-1 hover:bg-accent-soft"
                  >
                    Provider profile
                  </Link>
                </>
              ) : null}
              {isStaff ? (
                <Link
                  href="/admin/listings"
                  className="rounded-md px-2 py-1 hover:bg-accent-soft"
                >
                  Moderation
                </Link>
              ) : null}
              <Link
                href="/onboarding/roles"
                className="rounded-md px-2 py-1 hover:bg-accent-soft"
              >
                Roles
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-accent-soft"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-strong"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
