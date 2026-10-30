import Link from "next/link";
import { Suspense } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { PageFallback } from "@/components/page-fallback";
import {
  EmptyState,
  ListingCard,
  PageShell,
  Select,
  TextInput,
} from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { paymentModelLabel, t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const query = params.q?.trim() || undefined;
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
      let jobs = supabase
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
      if (categoryId) jobs = jobs.eq("category_id", categoryId);
      if (query) {
        jobs = jobs.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      return jobs;
    })(),
  ]);

  const { data: jobs, error } = jobsQuery;

  return (
    <PageShell
      title={copy.modules.farmJobs.title}
      subtitle={copy.jobsBrowseSubtitle}
      actions={
        <>
          {user?.roles.includes("farmer") ? (
            <Link
              href="/jobs/new"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {locale === "te" ? "కొత్త జాబ్" : "Post a job"}
            </Link>
          ) : null}
          {user?.roles.includes("worker") ||
          user?.roles.includes("labour_contractor") ? (
            <Link
              href="/worker/profile"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
            >
              {copy.workerProfile}
            </Link>
          ) : null}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_1fr]">
        <FilterPanel title={copy.filters}>
          <form className="grid gap-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.search}</span>
              <TextInput
                name="q"
                defaultValue={query ?? ""}
                placeholder={copy.searchPlaceholder}
              />
            </label>
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
            <button
              type="submit"
              className="min-h-11 w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.applyFilters}
            </button>
          </form>
        </FilterPanel>

        <div className="space-y-3">
          {error ? <p className="text-red-700">{error.message}</p> : null}
          {(jobs ?? []).length === 0 ? (
            <EmptyState
              title={
                locale === "te"
                  ? "ఇంకా ఆమోదించిన జాబ్‌లు లేవు."
                  : "No approved farm jobs match these filters yet."
              }
              body={
                locale === "te"
                  ? "ఫిల్టర్లు మార్చండి లేదా తర్వాత మళ్లీ చూడండి."
                  : "Try different filters or check again later."
              }
              action={
                user?.roles.includes("farmer") ? (
                  <Link
                    href="/jobs/new"
                    className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                  >
                    {locale === "te" ? "కొత్త జాబ్" : "Post a job"}
                  </Link>
                ) : (
                  <Link
                    href="/explore"
                    className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
                  >
                    {copy.browseMarketplace}
                  </Link>
                )
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {jobs?.map((job) => {
                const category = Array.isArray(job.job_categories)
                  ? job.job_categories[0]
                  : job.job_categories;
                const village = Array.isArray(job.villages)
                  ? job.villages[0]
                  : job.villages;
                const farmer = Array.isArray(job.profiles)
                  ? job.profiles[0]
                  : job.profiles;
                const eyebrow = category
                  ? locale === "te"
                    ? `${category.name_te} — ${category.name_en}`
                    : `${category.name_en} — ${category.name_te}`
                  : copy.modules.farmJobs.title;
                const payLabel = paymentModelLabel(locale, job.payment_model);

                return (
                  <ListingCard
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    eyebrow={eyebrow}
                    title={job.title}
                    description={job.description || undefined}
                    meta={
                      <>
                        {job.advertised_amount != null ? (
                          <span className="font-medium text-foreground">
                            ₹{job.advertised_amount}
                            {payLabel ? ` · ${payLabel}` : ""}
                          </span>
                        ) : null}
                        {village?.name ? <span>{village.name}</span> : null}
                        <span>
                          {job.workers_required} {copy.workers}
                        </span>
                        {job.work_date ? <span>{job.work_date}</span> : null}
                        <span>{farmer?.display_name ?? copy.farmer}</span>
                      </>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Farm Jobs" />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}
