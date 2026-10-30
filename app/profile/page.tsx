import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import { EmptyState, PageShell, Panel, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { roleLabel, t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function ProfileContent({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?next=/profile");

  const params = await searchParams;
  const showWelcome = params.welcome === "1";
  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const supabase = await createClient();
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  const links = [
    {
      href: "/notifications",
      label: copy.notifications,
      show: true,
      badge: unreadNotifications ?? 0,
      group: "account",
    },
    { href: "/bookings", label: copy.bookings, show: true, group: "account" },
    { href: "/messages", label: copy.messages, show: true, group: "account" },
    {
      href: "/onboarding/roles",
      label: copy.roles,
      show: true,
      group: "account",
    },
    {
      href: "/farmer/jobs",
      label: copy.myJobs,
      show: user.roles.includes("farmer"),
      group: "farmer",
    },
    {
      href: "/seller/crops",
      label: copy.myCrops,
      show: user.roles.includes("farmer"),
      group: "farmer",
    },
    {
      href: "/buyer/deals",
      label: copy.cropDeals,
      show:
        user.roles.includes("farmer") ||
        user.roles.includes("buyer") ||
        user.roles.includes("retailer"),
      group: "trade",
    },
    {
      href: "/buyer/requirements",
      label: copy.myRequirements,
      show: user.roles.includes("buyer") || user.roles.includes("retailer"),
      group: "buyer",
    },
    {
      href: "/buyer/profile",
      label: copy.buyerProfile,
      show: user.roles.includes("buyer") || user.roles.includes("retailer"),
      group: "buyer",
    },
    {
      href: "/worker/applications",
      label: copy.applications,
      show:
        user.roles.includes("worker") || user.roles.includes("labour_contractor"),
      group: "worker",
    },
    {
      href: "/worker/profile",
      label: copy.workerProfile,
      show:
        user.roles.includes("worker") || user.roles.includes("labour_contractor"),
      group: "worker",
    },
    {
      href: "/provider/listings",
      label: copy.myListings,
      show: user.roles.includes("service_provider"),
      group: "provider",
    },
    {
      href: "/provider/bookings",
      label: copy.providerBookings,
      show: user.roles.includes("service_provider"),
      group: "provider",
    },
    {
      href: "/provider/profile",
      label: copy.providerProfile,
      show: user.roles.includes("service_provider"),
      group: "provider",
    },
    {
      href: "/admin",
      label: copy.admin,
      show:
        user.roles.includes("administrator") || user.roles.includes("moderator"),
      group: "staff",
    },
  ].filter((item) => item.show);

  const roleNames = user.roles.map((role) => roleLabel(locale, role));

  const nextSteps = [
    {
      href: "/services",
      label: copy.homePrimaryFarmer,
      show: user.roles.includes("farmer"),
    },
    {
      href: "/jobs/new",
      label: locale === "te" ? "ఫార్మ్ జాబ్ పోస్ట్" : "Post a farm job",
      show: user.roles.includes("farmer"),
    },
    {
      href: "/jobs",
      label: copy.findJobs,
      show:
        user.roles.includes("worker") || user.roles.includes("labour_contractor"),
    },
    {
      href: "/create",
      label: copy.navCreate,
      show: user.roles.length > 0,
    },
    {
      href: "/notifications",
      label: copy.notifications,
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <PageShell title={copy.profileTitle} subtitle={copy.profileSubtitle}>
      {showWelcome ? (
        <Panel className="mb-4 border-accent bg-accent-soft/40">
          <h2 className="text-lg font-semibold">{copy.welcomeTitle}</h2>
          <p className="mt-2 text-sm text-muted">{copy.welcomeBody}</p>
          <p className="mt-2 text-sm text-muted">{copy.inboxExplainer}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {nextSteps.map((step) => (
              <Link
                key={step.href + step.label}
                href={step.href}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-accent-soft"
              >
                {step.label}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel className="mb-4">
        <p className="text-sm text-muted">{user.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roleNames.length > 0 ? (
            roleNames.map((name) => (
              <StatusBadge key={name} tone="success">
                {name}
              </StatusBadge>
            ))
          ) : (
            <p className="text-sm text-muted">{copy.noRolesYet}</p>
          )}
        </div>
        {roleNames.length === 0 ? (
          <div className="mt-4">
            <Link
              href="/onboarding/roles?next=/profile"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
            >
              {copy.roles}
            </Link>
          </div>
        ) : null}
      </Panel>

      {links.length === 0 ? (
        <EmptyState
          title={copy.noRolesYet}
          action={
            <Link
              href="/onboarding/roles?next=/profile"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.roles}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-accent"
            >
              <span>{item.label}</span>
              {"badge" in item && item.badge && item.badge > 0 ? (
                <StatusBadge tone="warning">
                  {item.badge > 99 ? "99+" : item.badge}
                </StatusBadge>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="My work" />}>
      <ProfileContent searchParams={searchParams} />
    </Suspense>
  );
}
