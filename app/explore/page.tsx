import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell } from "@/components/ui";
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
      te: copy.modules.farmServices.te,
    },
    {
      href: "/jobs",
      title: copy.modules.farmJobs.title,
      body: copy.modules.farmJobs.body,
      te: copy.modules.farmJobs.te,
    },
    {
      href: "/crops",
      title: copy.modules.cropMarketplace.title,
      body: copy.modules.cropMarketplace.body,
      te: copy.modules.cropMarketplace.te,
    },
    {
      href: "/buyers",
      title: copy.modules.buyersTraders.title,
      body: copy.modules.buyersTraders.body,
      te: copy.modules.buyersTraders.te,
    },
    {
      href: "/agri-mitra",
      title: copy.agriMitra,
      body: copy.agriMitraBody,
      te: locale === "te" ? "Voice assistant" : "వాయిస్ సహాయకుడు",
    },
  ];

  return (
    <PageShell title={copy.exploreTitle} subtitle={copy.exploreSubtitle}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:p-5"
          >
            <p className="text-xs text-muted sm:text-sm">{item.te}</p>
            <h2 className="mt-1 text-base font-semibold sm:text-xl">{item.title}</h2>
            <p className="mt-2 line-clamp-3 text-xs text-muted sm:text-sm">{item.body}</p>
          </Link>
        ))}
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
