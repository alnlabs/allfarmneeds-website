import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";

async function ProfileContent() {
  const user = await requireUser();
  if (!user) redirect("/login?next=/profile");

  const { locale } = await getRequestLocale();
  const copy = t(locale);

  const links = [
    { href: "/onboarding/roles", label: copy.roles, show: true },
    { href: "/notifications", label: copy.notifications, show: true },
    { href: "/bookings", label: copy.bookings, show: true },
    { href: "/messages", label: copy.messages, show: true },
    {
      href: "/farmer/jobs",
      label: copy.myJobs,
      show: user.roles.includes("farmer"),
    },
    {
      href: "/seller/crops",
      label: copy.myCrops,
      show: user.roles.includes("farmer"),
    },
    {
      href: "/buyer/deals",
      label: copy.cropDeals,
      show:
        user.roles.includes("farmer") ||
        user.roles.includes("buyer") ||
        user.roles.includes("retailer"),
    },
    {
      href: "/buyer/requirements",
      label: copy.myRequirements,
      show: user.roles.includes("buyer") || user.roles.includes("retailer"),
    },
    {
      href: "/buyer/profile",
      label: copy.buyerProfile,
      show: user.roles.includes("buyer") || user.roles.includes("retailer"),
    },
    {
      href: "/worker/applications",
      label: copy.applications,
      show:
        user.roles.includes("worker") || user.roles.includes("labour_contractor"),
    },
    {
      href: "/worker/profile",
      label: copy.workerProfile,
      show:
        user.roles.includes("worker") || user.roles.includes("labour_contractor"),
    },
    {
      href: "/provider/listings",
      label: copy.myListings,
      show: user.roles.includes("service_provider"),
    },
    {
      href: "/provider/bookings",
      label: copy.providerBookings,
      show: user.roles.includes("service_provider"),
    },
    {
      href: "/provider/profile",
      label: copy.providerProfile,
      show: user.roles.includes("service_provider"),
    },
    {
      href: "/admin",
      label: "Admin",
      show:
        user.roles.includes("administrator") || user.roles.includes("moderator"),
    },
  ].filter((item) => item.show);

  return (
    <PageShell title={copy.profileTitle} subtitle={copy.profileSubtitle}>
      <Panel className="mb-4">
        <p className="text-sm text-muted">{user.email}</p>
        <p className="mt-2 text-sm">
          {locale === "te" ? "పాత్రలు" : "Roles"}:{" "}
          {user.roles.length > 0 ? user.roles.join(", ") : "—"}
        </p>
      </Panel>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-accent"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<PageFallback title="Profile" />}>
      <ProfileContent />
    </Suspense>
  );
}
