import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { ListingCard, Panel, TextInput } from "@/components/ui";
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

async function FeaturedListings({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const supabase = await createClient();
  const [{ data: services }, { data: crops }] = await Promise.all([
    supabase
      .from("service_listings")
      .select(
        `
        id,
        title,
        description,
        price_amount,
        price_unit,
        photo_urls,
        service_categories(name_en, name_te)
      `,
      )
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("updated_at", { ascending: false })
      .limit(2),
    supabase
      .from("product_listings")
      .select(
        `
        id,
        title,
        description,
        expected_price,
        price_unit,
        quantity_available,
        quantity_unit,
        photo_urls,
        product_categories(name_en, name_te)
      `,
      )
      .in("status", ["published", "partially_sold"])
      .eq("moderation_status", "approved")
      .order("updated_at", { ascending: false })
      .limit(2),
  ]);

  const serviceCards = (services ?? []).map((listing) => {
    const category = Array.isArray(listing.service_categories)
      ? listing.service_categories[0]
      : listing.service_categories;
    const label = category
      ? categoryLabel(locale, category)
      : { primary: copy.farmServices };
    const price =
      listing.price_amount != null
        ? `₹${listing.price_amount}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
        : copy.priceOnEnquiry;
    return {
      key: `s-${listing.id}`,
      href: `/services/${listing.id}`,
      eyebrow: label.primary,
      title: listing.title,
      description: listing.description ?? undefined,
      meta: price,
      imageUrl: listing.photo_urls?.[0] ?? null,
    };
  });

  const cropCards = (crops ?? []).map((listing) => {
    const category = Array.isArray(listing.product_categories)
      ? listing.product_categories[0]
      : listing.product_categories;
    const label = category
      ? categoryLabel(locale, category)
      : { primary: copy.modules.cropMarketplace.title };
    const price =
      listing.expected_price != null
        ? `₹${listing.expected_price}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
        : copy.priceOnEnquiry;
    return {
      key: `c-${listing.id}`,
      href: `/crops/${listing.id}`,
      eyebrow: label.primary,
      title: listing.title,
      description: listing.description ?? undefined,
      meta: price,
      imageUrl: listing.photo_urls?.[0] ?? null,
    };
  });

  const cards = [...serviceCards, ...cropCards];

  if (cards.length === 0) {
    return <p className="text-sm text-muted">{copy.homeListingsEmpty}</p>;
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <ListingCard
          key={card.key}
          href={card.href}
          eyebrow={card.eyebrow}
          title={card.title}
          description={card.description}
          meta={<span>{card.meta}</span>}
          imageUrl={card.imageUrl}
        />
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/services"
          className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3 py-2 text-sm hover:bg-accent-soft"
        >
          {copy.homeSeeAllServices}
        </Link>
        <Link
          href="/crops"
          className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-3 py-2 text-sm hover:bg-accent-soft"
        >
          {copy.homeSeeAllCrops}
        </Link>
      </div>
    </div>
  );
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {categories?.map((category) => {
          const label = categoryLabel(locale, category);
          return (
            <Link
              key={category.id}
              href={`/services?category=${category.id}`}
              className="min-h-12 min-w-0 rounded-xl border border-border bg-white px-3 py-2.5 transition hover:border-accent"
            >
              <p className="truncate text-sm font-medium">{label.primary}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-3">
        <Link
          href="/services"
          className="inline-flex min-h-10 items-center text-sm font-medium text-accent-strong underline-offset-2 hover:underline"
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
  const createHref = signedIn ? "/create" : "/login?next=/create";

  const modules = [
    {
      href: "/services",
      title: copy.modules.farmServices.title,
      body: copy.homeModuleServicesShort,
    },
    {
      href: "/jobs",
      title: copy.modules.farmJobs.title,
      body: copy.homeModuleJobsShort,
    },
    {
      href: "/crops",
      title: copy.modules.cropMarketplace.title,
      body: copy.homeModuleCropsShort,
    },
    {
      href: "/buyers",
      title: copy.modules.buyersTraders.title,
      body: copy.homeModuleBuyersShort,
    },
  ];

  const trends = [
    { href: "/services?q=tractor", label: copy.homeTrendTractor },
    { href: "/crops?q=chilli", label: copy.homeTrendChilli },
    { href: "/services?q=harvester", label: copy.homeTrendHarvester },
  ];

  return (
    <main className="mx-auto w-full min-w-0 max-w-[var(--content-max)] px-4 py-5 sm:px-6 sm:py-8 lg:px-8 xl:px-10">
      <section className="mb-6 space-y-4 sm:mb-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-accent-strong break-words sm:text-3xl lg:text-4xl">
            {copy.homeHeadline}
          </h1>
          <p className="mt-2 break-words text-sm text-muted sm:text-base">
            {copy.homeSubtitle}
          </p>
        </div>

        <form
          action="/services"
          method="get"
          className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4"
        >
          <label className="sr-only" htmlFor="home-search">
            {copy.homeSearchLabel}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <TextInput
              id="home-search"
              name="q"
              placeholder={copy.homeSearchPlaceholder}
              aria-label={copy.search}
              className="min-h-11 flex-1"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-white hover:bg-accent-strong sm:shrink-0"
            >
              {copy.search}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">
              {copy.homeTrending}:
            </span>
            {trends.map((trend) => (
              <Link
                key={trend.href}
                href={trend.href}
                className="rounded-full border border-border bg-accent-soft/60 px-3 py-1 text-xs font-medium text-accent-strong hover:bg-accent-soft"
              >
                {trend.label}
              </Link>
            ))}
          </div>
        </form>
      </section>

      <section className="mb-6 sm:mb-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold sm:text-xl">
            {copy.homeMarketplaceTitle}
          </h2>
          <Link
            href="/explore"
            className="text-sm font-medium text-accent-strong underline-offset-2 hover:underline"
          >
            {copy.homeSeeAllCategories}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="min-w-0 rounded-2xl border border-border bg-white p-3 transition hover:border-accent sm:p-4"
            >
              <h3 className="break-words text-sm font-semibold leading-snug sm:text-base">
                {module.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 break-words text-xs text-muted sm:text-sm">
                {module.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 sm:mb-8">
        <Link
          href="/agri-mitra"
          className="block w-full rounded-2xl bg-accent px-4 py-4 text-white shadow-sm transition hover:bg-accent-strong sm:px-5 sm:py-5"
        >
          <p className="text-xs text-white/85 sm:text-sm">
            {copy.homeAgriMitraEyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold sm:text-xl">
            {copy.agriMitra}
          </h2>
          <p className="mt-2 text-sm text-white/90">{copy.agriMitraBody}</p>
          <span className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-white/15 px-3 py-2 text-sm font-medium">
            {copy.homeAgriMitraCta}
          </span>
        </Link>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 text-lg font-semibold sm:text-xl">
          {copy.homeListingsTitle}
        </h2>
        <Suspense fallback={<p className="text-muted">{copy.loading}</p>}>
          <FeaturedListings locale={locale} />
        </Suspense>
      </section>

      <section className="mb-6 sm:mb-8">
        <Panel>
          <h2 className="mb-3 text-base font-semibold sm:text-lg">
            {copy.homeCategoriesTitle}
          </h2>
          <Suspense fallback={<p className="text-muted">{copy.loading}</p>}>
            <FeaturedCategories locale={locale} />
          </Suspense>
        </Panel>
      </section>

      <section className="mb-6 sm:mb-8">
        <Panel className="bg-accent-soft/40">
          <h2 className="text-base font-semibold sm:text-lg">
            {copy.homeTrustTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">{copy.homeTrustBody}</p>
        </Panel>
      </section>

      <section className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={createHref}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-strong"
        >
          {copy.homePostAd}
        </Link>
        <Link
          href={primary.href}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-accent-soft"
        >
          {primary.label}
        </Link>
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
