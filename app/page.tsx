import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { Panel, TextInput } from "@/components/ui";
import { requireUser, type AppRole } from "@/lib/auth";
import { categoryLabel, t, type Locale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

function primaryCta(
  copy: ReturnType<typeof t>,
  roles: AppRole[],
  signedIn: boolean,
): { href: string; label: string } {
  if (!signedIn) {
    return { href: "/login?next=/onboarding/roles", label: copy.homePrimaryGuest };
  }
  if (roles.includes("farmer")) {
    return { href: "/services", label: copy.homePrimaryFarmer };
  }
  if (roles.includes("worker") || roles.includes("labour_contractor")) {
    return { href: "/jobs", label: copy.homePrimaryWorker };
  }
  if (roles.includes("service_provider")) {
    return { href: "/provider/listings", label: copy.homePrimaryProvider };
  }
  if (roles.includes("buyer") || roles.includes("retailer")) {
    return { href: "/buyers/new", label: copy.homePrimaryBuyer };
  }
  return { href: "/profile", label: copy.homePrimaryDefault };
}

async function FeaturedCategories({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("service_categories")
    .select("id, slug, name_en, name_te")
    .order("name_en")
    .limit(6);

  if (error) {
    return <p className="text-red-700">{error.message}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => {
          const label = categoryLabel(locale, category);
          return (
            <Link
              key={category.id}
              href={`/services?category=${category.id}`}
              className="min-h-14 min-w-0 rounded-2xl border border-border bg-white p-3 transition hover:border-accent sm:p-4"
            >
              <p className="break-words text-sm font-medium sm:text-base">
                {label.primary}
              </p>
              <p className="mt-1 break-words text-xs text-muted sm:text-sm">
                {label.secondary}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="mt-4">
        <Link
          href="/services"
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-accent-soft"
        >
          {copy.homeSeeAllCategories}
        </Link>
      </div>
    </>
  );
}

async function HomeContent() {
  const user = await requireUser();
  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const roles = user?.roles ?? [];
  const signedIn = Boolean(user);
  const primary = primaryCta(copy, roles, signedIn);

  const modules = [
    {
      href: "/services",
      title: copy.modules.farmServices.title,
      alt: copy.modules.farmServices.te,
      body: copy.modules.farmServices.body,
    },
    {
      href: "/jobs",
      title: copy.modules.farmJobs.title,
      alt: copy.modules.farmJobs.te,
      body: copy.modules.farmJobs.body,
    },
    {
      href: "/crops",
      title: copy.modules.cropMarketplace.title,
      alt: copy.modules.cropMarketplace.te,
      body: copy.modules.cropMarketplace.body,
    },
    {
      href: "/buyers",
      title: copy.modules.buyersTraders.title,
      alt: copy.modules.buyersTraders.te,
      body: copy.modules.buyersTraders.body,
    },
  ];

  const ctaClass =
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-medium sm:w-auto";

  return (
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* B. Task-oriented hero — brand stays in header */}
      <section className="mb-8 space-y-5">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-accent-strong break-words sm:text-3xl">
            {copy.homeHeadline}
          </h1>
          <p className="mt-2 break-words text-sm text-muted sm:text-base">
            {copy.homeSubtitle}
          </p>
        </div>

        <Panel>
          <form action="/services" method="get" className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium">{copy.homeSearchLabel}</span>
              <TextInput
                name="q"
                placeholder={copy.homeSearchPlaceholder}
                aria-label={copy.search}
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="submit"
                className={`${ctaClass} bg-accent text-white hover:bg-accent-strong`}
              >
                {copy.search}
              </button>
              <Link
                href={primary.href}
                className={`${ctaClass} border border-border bg-white hover:bg-accent-soft`}
              >
                {primary.label}
              </Link>
              <Link
                href="/explore"
                className={`${ctaClass} border border-border bg-white hover:bg-accent-soft`}
              >
                {copy.homeSecondaryExplore}
              </Link>
            </div>
          </form>
        </Panel>
      </section>

      {/* C. Marketplace discovery */}
      <section className="mb-6 md:mb-8">
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">
          {copy.homeMarketplaceTitle}
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="min-w-0 rounded-2xl border border-border bg-white p-3 transition hover:border-accent sm:p-5"
            >
              <p className="truncate text-xs text-muted sm:text-sm">{module.alt}</p>
              <h3 className="mt-1 break-words text-sm font-semibold leading-snug sm:text-xl">
                {module.title}
              </h3>
              <p className="mt-2 line-clamp-3 break-words text-xs text-muted sm:text-sm">
                {module.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* D. Agri Mitra */}
      <section className="mb-6 md:mb-8">
        <Link
          href="/agri-mitra"
          className="block w-full min-w-0 rounded-2xl border border-border bg-accent-soft/50 p-4 transition hover:border-accent sm:p-5"
        >
          <p className="text-xs text-muted sm:text-sm">{copy.homeAgriMitraEyebrow}</p>
          <h2 className="mt-1 text-base font-semibold sm:text-xl">{copy.agriMitra}</h2>
          <p className="mt-2 break-words text-xs text-muted sm:text-sm">
            {copy.agriMitraBody}
          </p>
        </Link>
      </section>

      {/* E. Popular categories (6 + see all) */}
      <section className="mb-6 md:mb-8">
        <Panel>
          <h2 className="mb-4 text-lg font-semibold">{copy.homeCategoriesTitle}</h2>
          <Suspense fallback={<p className="text-muted">{copy.loading}</p>}>
            <FeaturedCategories locale={locale} />
          </Suspense>
        </Panel>
      </section>

      {/* F. Trust */}
      <section className="mb-2">
        <Panel className="bg-accent-soft/40">
          <h2 className="text-base font-semibold sm:text-lg">{copy.homeTrustTitle}</h2>
          <p className="mt-2 text-sm text-muted">{copy.homeTrustBody}</p>
        </Panel>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageFallback title="AllFarmNeeds" />}>
      <HomeContent />
    </Suspense>
  );
}
