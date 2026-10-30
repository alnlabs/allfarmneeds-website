import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions/jobs";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function WorkerApplicationsContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("worker") && !user.roles.includes("labour_contractor")) {
    redirect("/onboarding/roles?next=/worker/applications");
  }

  const supabase = await createClient();
  const { data: applications, error } = await supabase
    .from("job_applications")
    .select(
      `
      id,
      status,
      note,
      farm_jobs(
        id,
        title,
        work_date,
        status,
        farmer_id,
        profiles!farm_jobs_farmer_id_fkey(display_name)
      )
    `,
    )
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  const selectedIds = (applications ?? [])
    .filter((application) => application.status === "selected")
    .map((application) => application.id);
  const { data: existingReviews } =
    selectedIds.length > 0
      ? await supabase
          .from("reviews")
          .select("entity_id")
          .eq("reviewer_id", user.id)
          .eq("entity_type", "job_application")
          .in("entity_id", selectedIds)
      : { data: [] };
  const reviewed = new Set((existingReviews ?? []).map((row) => row.entity_id));

  return (
    <PageShell
      title="My applications"
      subtitle="Track farm job applications and withdraw if needed."
      actions={
        <Link
          href="/jobs"
          className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
        >
          Browse jobs
        </Link>
      }
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(applications ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No applications yet.</p>
          </Panel>
        ) : (
          applications?.map((application) => {
            const job = Array.isArray(application.farm_jobs)
              ? application.farm_jobs[0]
              : application.farm_jobs;
            const farmer = job
              ? Array.isArray(job.profiles)
                ? job.profiles[0]
                : job.profiles
              : null;
            return (
              <Panel key={application.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {job?.title ?? "Farm job"}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Status: {application.status}
                      {job?.work_date ? ` · ${job.work_date}` : ""}
                      {farmer?.display_name ? ` · ${farmer.display_name}` : ""}
                    </p>
                    {application.note ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {application.note}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {job?.id ? (
                      <Link
                        href={`/jobs/${job.id}`}
                        className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                      >
                        View job
                      </Link>
                    ) : null}
                    {application.status === "submitted" ? (
                      <form action={updateApplicationStatus}>
                        <input
                          type="hidden"
                          name="application_id"
                          value={application.id}
                        />
                        <input type="hidden" name="status" value="withdrawn" />
                        <input
                          type="hidden"
                          name="return_to"
                          value="/worker/applications"
                        />
                        <SecondaryButton type="submit">Withdraw</SecondaryButton>
                      </form>
                    ) : null}
                  </div>
                </div>
                {application.status === "selected" &&
                job?.farmer_id &&
                !reviewed.has(application.id) ? (
                  <ReviewForm
                    entityType="job_application"
                    entityId={application.id}
                    revieweeId={job.farmer_id}
                    revieweeLabel={farmer?.display_name ?? "farmer"}
                    returnTo="/worker/applications"
                  />
                ) : null}
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function WorkerApplicationsPage() {
  return (
    <Suspense fallback={<PageFallback title="My applications" />}>
      <WorkerApplicationsContent />
    </Suspense>
  );
}
