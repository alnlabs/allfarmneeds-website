import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, Select } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: categories }, jobsQuery] = await Promise.all([
    supabase
      .from("job_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    (async () => {
      let query = supabase
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
          job_categories(name_en, name_te),
          villages(name),
          profiles!farm_jobs_farmer_id_fkey(display_name)
        `,
        )
        .eq("status", "published")
        .eq("moderation_status", "approved")
        .order("work_date", { ascending: true, nullsFirst: false });
      if (categoryId) query = query.eq("category_id", categoryId);
      return query;
    })(),
  ]);

  const { data: jobs, error } = jobsQuery;

  return (
    <PageShell
      title={copy.modules.farmJobs.title}
      subtitle={
        locale === "te"
          ? "ఆమోదించిన పొలం పనులు చూడండి మరియు దరఖాస్తు చేయండి."
          : "Browse approved farm jobs near you and apply as a worker."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {user?.roles.includes("farmer") ? (
            <Link
              href="/jobs/new"
              className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {locale === "te" ? "కొత్త జాబ్" : "Post a job"}
            </Link>
          ) : null}
          {user?.roles.includes("worker") ||
          user?.roles.includes("labour_contractor") ? (
            <Link
              href="/worker/profile"
              className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
            >
              {locale === "te" ? "వర్కర్ ప్రొఫైల్" : "Worker profile"}
            </Link>
          ) : null}
        </div>
      }
    >
      <Panel>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="space-y-2 text-sm">
            <span className="font-medium">{copy.category}</span>
            <Select name="category" defaultValue={categoryId ?? ""}>
              <option value="">{copy.allCategories}</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {locale === "te"
                    ? `${category.name_te} — ${category.name_en}`
                    : `${category.name_en} — ${category.name_te}`}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong sm:w-auto"
            >
              {copy.applyFilters}
            </button>
          </div>
        </form>
      </Panel>

      <div className="mt-6 space-y-3">
        {error ? <p className="text-red-700">{error.message}</p> : null}
        {(jobs ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">
              {locale === "te"
                ? "ఇంకా ఆమోదించిన జాబ్‌లు లేవు."
                : "No approved farm jobs match these filters yet."}
            </p>
          </Panel>
        ) : (
          jobs?.map((job) => {
            const category = Array.isArray(job.job_categories)
              ? job.job_categories[0]
              : job.job_categories;
            const village = Array.isArray(job.villages)
              ? job.villages[0]
              : job.villages;
            const farmer = Array.isArray(job.profiles)
              ? job.profiles[0]
              : job.profiles;

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-2xl border border-border bg-white p-5 transition hover:border-accent"
              >
                <p className="text-sm text-muted">
                  {category
                    ? locale === "te"
                      ? `${category.name_te} — ${category.name_en}`
                      : `${category.name_en} — ${category.name_te}`
                    : copy.modules.farmJobs.title}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{job.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {job.description || "—"}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                  <span>
                    {job.workers_required}{" "}
                    {locale === "te" ? "మంది" : "workers"}
                  </span>
                  {job.work_date ? <span>{job.work_date}</span> : null}
                  {village?.name ? <span>{village.name}</span> : null}
                  {job.advertised_amount != null ? (
                    <span>
                      ₹{job.advertised_amount}
                      {job.payment_model ? ` / ${job.payment_model}` : ""}
                    </span>
                  ) : null}
                  <span>{farmer?.display_name ?? "Farmer"}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Farm Jobs" />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}
