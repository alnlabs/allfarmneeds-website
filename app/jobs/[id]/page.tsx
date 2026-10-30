import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { applyToJob } from "@/app/actions/jobs";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
import { Field, PageShell, Panel, PrimaryButton, TextArea } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function JobDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  if (!jobId) notFound();

  const query = await searchParams;
  const user = await requireUser();
  const isStaff =
    !!user &&
    (user.roles.includes("administrator") || user.roles.includes("moderator"));
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("farm_jobs")
    .select(
      `
      id,
      title,
      description,
      workers_required,
      work_date,
      payment_model,
      advertised_amount,
      food_water_accommodation,
      status,
      moderation_status,
      farmer_id,
      job_categories(name_en, name_te),
      villages(name),
      profiles!farm_jobs_farmer_id_fkey(display_name)
    `,
    )
    .eq("id", jobId)
    .maybeSingle();

  const isOwner = user?.id === job?.farmer_id;
  const isPublic =
    job?.status === "published" && job?.moderation_status === "approved";

  if (error || !job || (!isPublic && !isOwner && !isStaff)) {
    notFound();
  }

  const category = Array.isArray(job.job_categories)
    ? job.job_categories[0]
    : job.job_categories;
  const village = Array.isArray(job.villages) ? job.villages[0] : job.villages;
  const farmer = Array.isArray(job.profiles) ? job.profiles[0] : job.profiles;
  const canApply =
    !!user &&
    !isOwner &&
    isPublic &&
    (user.roles.includes("worker") || user.roles.includes("labour_contractor"));

  return (
    <PageShell
      title={job.title}
      subtitle={
        category
          ? `${category.name_te} — ${category.name_en}`
          : "Farm job"
      }
    >
      {!isPublic ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Not public yet (status: {job.status}, moderation: {job.moderation_status}).
        </p>
      ) : null}
      {query.error ? (
        <p className="mb-4 text-sm text-red-700">{query.error}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <p className="text-sm text-muted">
            {farmer?.display_name ?? "Farmer"}
            {village?.name ? ` · ${village.name}` : ""}
          </p>
          <p className="mt-4 whitespace-pre-wrap">
            {job.description || "No description provided."}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Workers required</dt>
              <dd className="font-medium">{job.workers_required}</dd>
            </div>
            <div>
              <dt className="text-muted">Work date</dt>
              <dd className="font-medium">{job.work_date || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Payment</dt>
              <dd className="font-medium">
                {job.advertised_amount != null
                  ? `₹${job.advertised_amount}${job.payment_model ? ` / ${job.payment_model}` : ""}`
                  : job.payment_model || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Food / stay</dt>
              <dd className="font-medium">
                {job.food_water_accommodation || "—"}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Apply</h2>
          <p className="mt-2 text-sm text-muted">
            Workers with a profile can apply. Farmers review applications from My jobs.
          </p>
          <div className="mt-4">
            {!user ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
                className="inline-flex rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
              >
                Sign in to apply
              </Link>
            ) : isOwner ? (
              <Link
                href="/farmer/jobs"
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Manage applications
              </Link>
            ) : canApply ? (
              <form action={applyToJob} className="space-y-4">
                <input type="hidden" name="job_id" value={job.id} />
                <Field label="Note to farmer">
                  <TextArea
                    name="note"
                    rows={4}
                    placeholder="Experience, villages you cover, when you can start…"
                  />
                </Field>
                <PrimaryButton type="submit">Submit application</PrimaryButton>
              </form>
            ) : (
              <Link
                href={`/onboarding/roles?next=${encodeURIComponent(`/jobs/${job.id}`)}`}
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Add worker role to apply
              </Link>
            )}
          </div>
        </Panel>
      </div>

      {user ? (
        <div className="mt-6">
          <ReportForm
            targetType="farm_job"
            targetId={job.id}
            returnTo={`/jobs/${job.id}`}
          />
        </div>
      ) : null}
    </PageShell>
  );
}

export default function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Farm job" />}>
      <JobDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
