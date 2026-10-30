import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminDashboardContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const supabase = await createClient();
  const [
    services,
    jobs,
    crops,
    buyers,
    reports,
  ] = await Promise.all([
    supabase
      .from("service_listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending"),
    supabase
      .from("farm_jobs")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending"),
    supabase
      .from("product_listings")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending"),
    supabase
      .from("buyer_requirements")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  const cards = [
    {
      href: "/admin/listings",
      title: "Service listings",
      count: services.count ?? 0,
    },
    {
      href: "/admin/jobs",
      title: "Farm jobs",
      count: jobs.count ?? 0,
    },
    {
      href: "/admin/crops",
      title: "Crop listings",
      count: crops.count ?? 0,
    },
    {
      href: "/admin/buyers",
      title: "Buyer requirements",
      count: buyers.count ?? 0,
    },
    {
      href: "/admin/reports",
      title: "Open reports",
      count: reports.count ?? 0,
    },
    {
      href: "/admin/reviews",
      title: "Reviews",
      count: null as number | null,
    },
  ];

  return (
    <PageShell
      title="Admin dashboard"
      subtitle="Pending moderation and trust queues across marketplace modules."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-white p-5 transition hover:border-accent"
          >
            <p className="text-sm text-muted">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold">
              {card.count == null ? "→" : card.count}
            </p>
            <p className="mt-1 text-sm text-muted">
              {card.count == null ? "Moderate reviews" : "Pending / open"}
            </p>
          </Link>
        ))}
      </div>
      <Panel className="mt-6">
        <p className="text-sm text-muted">
          Use the header moderation links or these cards. Counts refresh on each visit.
        </p>
      </Panel>
    </PageShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<PageFallback title="Admin dashboard" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
