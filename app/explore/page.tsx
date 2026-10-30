import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, TextInput } from "@/components/ui";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";

async function ExploreContent() {
  const { locale } = await getRequestLocale();
  const copy = t(locale);

  const items = [
    {
      href: "/services",
      title: copy.modules.farmServices.title,
      body: copy.modules.farmServices.body,
      alt: copy.modules.farmServices.te,
    },
    {
      href: "/jobs",
      title: copy.modules.farmJobs.title,
      body: copy.modules.farmJobs.body,
      alt: copy.modules.farmJobs.te,
    },
    {
      href: "/crops",
      title: copy.modules.cropMarketplace.title,
      body: copy.modules.cropMarketplace.body,
      alt: copy.modules.cropMarketplace.te,
    },
    {
      href: "/buyers",
      title: copy.modules.buyersTraders.title,
      body: copy.modules.buyersTraders.body,
      alt: copy.modules.buyersTraders.te,
    },
  ];

  return (
    <PageShell title={copy.exploreTitle} subtitle={copy.exploreSubtitle}>
      <Panel className="mb-4">
        <form action="/services" method="get" className="space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium">{copy.exploreSearchHint}</span>
            <TextInput
              name="q"
              placeholder={copy.searchPlaceholder}
              aria-label={copy.search}
            />
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong sm:w-auto"
          >
            {copy.search}
          </button>
        </form>
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:p-5"
          >
            <p className="text-xs text-muted sm:text-sm">{item.alt}</p>
            <h2 className="mt-1 text-lg font-semibold sm:text-xl">{item.title}</h2>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <Link
          href="/agri-mitra"
          className="block rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:p-5"
        >
          <p className="text-xs text-muted sm:text-sm">
            {locale === "te" ? "మాట్లాడండి లేదా టైప్ చేయండి" : "Talk or type"}
          </p>
          <h2 className="mt-1 text-lg font-semibold sm:text-xl">{copy.agriMitra}</h2>
          <p className="mt-2 text-sm text-muted">{copy.agriMitraBody}</p>
        </Link>
      </div>
    </PageShell>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<PageFallback title="Explore" />}>
      <ExploreContent />
    </Suspense>
  );
}
