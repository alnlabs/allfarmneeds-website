import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { moderateFarmJob } from "@/app/actions/jobs";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminJobsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const params = await searchParams;
  const filter = params.status ?? "pending";
  const supabase = await createClient();
  let query = supabase
    .from("farm_jobs")
    .select(
      `
      id,
      title,
      status,
      moderation_status,
      updated_at,
      job_categories(name_en, name_te),
      profiles!farm_jobs_farmer_id_fkey(display_name)
    `,
    )
    .order("updated_at", { ascending: false });
  if (filter !== "all") {
    query = query.eq("moderation_status", filter);
  }
  const { data: jobs, error } = await query;

  return (
    <PageShell
      title="Job moderation"
      subtitle="Approve or reject published farm jobs before workers can apply."
      actions={
        <div className="flex flex-wrap gap-2 text-sm">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Link
              key={status}
              href={`/admin/jobs?status=${status}`}
              className={`rounded-lg border px-3 py-1.5 ${
                filter === status
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-white hover:bg-accent-soft"
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
      }
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(jobs ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No jobs in this filter.</p>
          </Panel>
        ) : (
          jobs?.map((job) => {
            const category = Array.isArray(job.job_categories)
              ? job.job_categories[0]
              : job.job_categories;
            const farmer = Array.isArray(job.profiles)
              ? job.profiles[0]
              : job.profiles;
            return (
              <Panel key={job.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Job"}
                    </p>
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {farmer?.display_name ?? "Farmer"} · Listing: {job.status} ·
                      Moderation: {job.moderation_status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      View
                    </Link>
                    <form action={moderateFarmJob}>
                      <input type="hidden" name="job_id" value={job.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <PrimaryButton type="submit">Approve</PrimaryButton>
                    </form>
                    <form action={moderateFarmJob}>
                      <input type="hidden" name="job_id" value={job.id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <SecondaryButton type="submit">Reject</SecondaryButton>
                    </form>
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Job moderation" />}>
      <AdminJobsContent searchParams={searchParams} />
    </Suspense>
  );
}
