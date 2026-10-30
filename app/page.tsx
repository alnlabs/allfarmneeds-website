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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories?.map((category) => {
        const label = categoryLabel(locale, category);
        return (
          <Link
            key={category.id}
            href={`/services?category=${category.id}`}
            className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent"
          >
            <p className="font-medium">{label.primary}</p>
            <p className="text-sm text-muted">{label.secondary}</p>
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
      live: true,
    },
    {
      href: null,
      ...copy.modules.farmJobs,
      live: false,
    },
    {
      href: null,
      ...copy.modules.cropMarketplace,
      live: false,
    },
    {
      href: null,
      ...copy.modules.buyersTraders,
      live: false,
    },
  ] as const;

  return (
    <PageShell
      title="AllFarmNeeds"
      subtitle={copy.homeSubtitle}
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/services"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            {copy.browseServices}
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            {copy.signInRegister}
          </Link>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) =>
          module.live && module.href ? (
            <Link
              key={module.title}
              href={module.href}
              className="rounded-2xl border border-border bg-white p-5 transition hover:border-accent"
            >
              <p className="text-sm text-muted">{module.te}</p>
              <h2 className="mt-1 text-xl font-semibold">{module.title}</h2>
              <p className="mt-2 text-sm text-muted">{module.body}</p>
            </Link>
          ) : (
            <div
              key={module.title}
              className="rounded-2xl border border-dashed border-border bg-white p-5"
            >
              <p className="text-sm text-muted">{module.te}</p>
              <h2 className="mt-1 text-xl font-semibold">{module.title}</h2>
              <p className="mt-2 text-sm text-muted">{module.body}</p>
            </div>
          ),
        )}
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
