import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions/jobs";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function FarmerJobsContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/farmer/jobs");
  }

  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("farm_jobs")
    .select(
      `
      id,
      title,
      status,
      moderation_status,
      workers_required,
      work_date,
      job_categories(name_en, name_te),
      job_applications(
        id,
        status,
        note,
        worker_id,
        profiles!job_applications_worker_id_fkey(display_name)
      )
    `,
    )
    .eq("farmer_id", user.id)
    .order("updated_at", { ascending: false });

  const selectedIds = (jobs ?? []).flatMap((job) => {
    const applications = Array.isArray(job.job_applications)
      ? job.job_applications
      : job.job_applications
        ? [job.job_applications]
        : [];
    return applications
      .filter((application) => application.status === "selected")
      .map((application) => application.id);
  });
  const { data: existingReviews } =
    selectedIds.length > 0
      ? await supabase
          .from("reviews")
          .select("entity_id")
          .eq("reviewer_id", user.id)
          .eq("entity_type", "job_application")
          .in("entity_id", selectedIds)
      : { data: [] };
  const reviewed = new Set((existingReviews ?? []).map((r) => r.entity_id));

  return (
    <PageShell
      title="My farm jobs"
      subtitle="Publish jobs and select workers from applications."
      actions={
        <Link
          href="/jobs/new"
          className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
        >
          Post a job
        </Link>
      }
    >
      <div className="space-y-4">
        {(jobs ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No jobs yet.</p>
          </Panel>
        ) : (
          jobs?.map((job) => {
            const category = Array.isArray(job.job_categories)
              ? job.job_categories[0]
              : job.job_categories;
            const applications = Array.isArray(job.job_applications)
              ? job.job_applications
              : job.job_applications
                ? [job.job_applications]
                : [];

            return (
              <Panel key={job.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Job"}
                    </p>
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Status: {job.status} · Moderation: {job.moderation_status}
                      {job.work_date ? ` · ${job.work_date}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                  >
                    View
                  </Link>
                </div>

                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <h3 className="font-medium">Applications ({applications.length})</h3>
                  {applications.length === 0 ? (
                    <p className="text-sm text-muted">No applications yet.</p>
                  ) : (
                    applications.map((application) => {
                      const worker = Array.isArray(application.profiles)
                        ? application.profiles[0]
                        : application.profiles;
                      return (
                        <div
                          key={application.id}
                          className="rounded-xl border border-border bg-accent-soft/40 p-3"
                        >
                          <p className="font-medium">
                            {worker?.display_name ?? "Worker"} · {application.status}
                          </p>
                          {application.note ? (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                              {application.note}
                            </p>
                          ) : null}
                          {application.status === "submitted" ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <form action={updateApplicationStatus}>
                                <input
                                  type="hidden"
                                  name="application_id"
                                  value={application.id}
                                />
                                <input type="hidden" name="status" value="selected" />
                                <input type="hidden" name="return_to" value="/farmer/jobs" />
                                <PrimaryButton type="submit">Select</PrimaryButton>
                              </form>
                              <form action={updateApplicationStatus}>
                                <input
                                  type="hidden"
                                  name="application_id"
                                  value={application.id}
                                />
                                <input type="hidden" name="status" value="declined" />
                                <input type="hidden" name="return_to" value="/farmer/jobs" />
                                <SecondaryButton type="submit">Decline</SecondaryButton>
                              </form>
                            </div>
                          ) : null}
                          {application.status === "selected" &&
                          !reviewed.has(application.id) ? (
                            <ReviewForm
                              entityType="job_application"
                              entityId={application.id}
                              revieweeId={application.worker_id}
                              revieweeLabel={worker?.display_name ?? "worker"}
                              returnTo="/farmer/jobs"
                            />
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function FarmerJobsPage() {
  return (
    <Suspense fallback={<PageFallback title="My farm jobs" />}>
      <FarmerJobsContent />
    </Suspense>
  );
}
