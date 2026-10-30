import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { categoryLabel, t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function FeaturedCategories() {
  const { locale } = await getRequestLocale();
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("service_categories")
    .select("id, slug, name_en, name_te")
    .order("name_en");

  if (error) {
    return <p className="text-red-700">{error.message}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {categories?.map((category) => {
        const label = categoryLabel(locale, category);
        return (
          <Link
            key={category.id}
            href={`/services?category=${category.id}`}
            className="rounded-2xl border border-border bg-white p-3 transition hover:border-accent sm:p-4"
          >
            <p className="text-sm font-medium sm:text-base">{label.primary}</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{label.secondary}</p>
          </Link>
        );
      })}
    </div>
  );
}

async function HomeContent() {
  const { locale } = await getRequestLocale();
  const copy = t(locale);

  const modules = [
    {
      href: "/services",
      ...copy.modules.farmServices,
    },
    {
      href: "/jobs",
      ...copy.modules.farmJobs,
    },
    {
      href: "/crops",
      ...copy.modules.cropMarketplace,
    },
    {
      href: "/buyers",
      ...copy.modules.buyersTraders,
    },
  ] as const;

  return (
    <PageShell
      title="AllFarmNeeds"
      subtitle={copy.homeSubtitle}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/services"
            className="rounded-xl bg-accent px-4 py-2.5 text-center font-medium text-white hover:bg-accent-strong"
          >
            {copy.browseServices}
          </Link>
          <Link
            href="/explore"
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-center hover:bg-accent-soft"
          >
            {copy.navExplore}
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-center hover:bg-accent-soft"
          >
            {copy.signInRegister}
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:p-5"
          >
            <p className="text-xs text-muted sm:text-sm">{module.te}</p>
            <h2 className="mt-1 text-base font-semibold sm:text-xl">{module.title}</h2>
            <p className="mt-2 line-clamp-3 text-xs text-muted sm:text-sm">
              {module.body}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-3">
        <Link
          href="/agri-mitra"
          className="block rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:p-5"
        >
          <p className="text-xs text-muted sm:text-sm">
            {locale === "te" ? "వాయిస్ సహాయకుడు" : "Voice assistant"}
          </p>
          <h2 className="mt-1 text-base font-semibold sm:text-xl">{copy.agriMitra}</h2>
          <p className="mt-2 text-xs text-muted sm:text-sm">{copy.agriMitraBody}</p>
        </Link>
      </div>

      <div className="mt-6">
        <Panel>
          <h2 className="mb-4 text-lg font-semibold">{copy.serviceCategories}</h2>
          <Suspense fallback={<p className="text-muted">…</p>}>
            <FeaturedCategories />
          </Suspense>
        </Panel>
      </div>
    </PageShell>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageFallback title="AllFarmNeeds" />}>
      <HomeContent />
    </Suspense>
  );
}
