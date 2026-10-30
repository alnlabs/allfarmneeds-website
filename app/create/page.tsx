import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import { EmptyState, PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";

async function CreateContent() {
  const user = await requireUser();
  if (!user) redirect("/login?next=/create");

  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const isWorker =
    user.roles.includes("worker") || user.roles.includes("labour_contractor");

  const actions = [
    {
      show: user.roles.includes("service_provider"),
      href: "/provider/listings/new",
      title: locale === "te" ? "సేవా జాబితా" : "New service listing",
      body:
        locale === "te"
          ? "ట్రాక్టర్, కూలీ లేదా ఇతర సేవలు ప్రచురించండి."
          : "Publish tractor, labour or other farm services.",
    },
    {
      show: user.roles.includes("farmer"),
      href: "/jobs/new",
      title: locale === "te" ? "ఫార్మ్ జాబ్" : "Post a farm job",
      body:
        locale === "te"
          ? "కూలీలను నియమించడానికి ఉద్యోగం పోస్ట్ చేయండి."
          : "Hire workers near your village.",
    },
    {
      show: user.roles.includes("farmer"),
      href: "/crops/new",
      title: locale === "te" ? "పంట అమ్మకం" : "Sell produce",
      body:
        locale === "te"
          ? "పరిమాణం మరియు ధరతో పంట జాబితా."
          : "List quantity, price and photos for buyers.",
    },
    {
      show: user.roles.includes("buyer") || user.roles.includes("retailer"),
      href: "/buyers/new",
      title: locale === "te" ? "కొనుగోలు అవసరం" : "Post purchase requirement",
      body:
        locale === "te"
          ? "మీకు కావాల్సిన పంట తెలియజేయండి."
          : "Tell sellers what produce you need.",
    },
    {
      show: isWorker,
      href: "/jobs",
      title: copy.findJobs,
      body: copy.findJobsBody,
    },
    {
      show: isWorker,
      href: "/worker/profile",
      title: copy.workerProfile,
      body:
        locale === "te"
          ? "మీ నైపుణ్యాలు మరియు గ్రామం అప్‌డేట్ చేయండి."
          : "Keep skills and village details up to date.",
    },
  ].filter((item) => item.show);

  return (
    <PageShell
      title={copy.createTitle}
      subtitle={copy.createSubtitle}
      actions={
        <Link
          href="/onboarding/roles?next=/create"
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
        >
          {copy.roles}
        </Link>
      }
    >
      {actions.length === 0 ? (
        <EmptyState
          title={
            locale === "te"
              ? "సృష్టించడానికి ఒక పాత్ర ఎంచుకోండి"
              : "Choose a role to create listings"
          }
          body={
            locale === "te"
              ? "రైతు, కూలీ, ప్రొవైడర్ లేదా కొనుగోలుదారు పాత్ర అవసరం."
              : "Add farmer, worker, provider or buyer role first."
          }
          action={
            <Link
              href="/onboarding/roles?next=/create"
              className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.roles}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((item) => (
            <Link key={item.href} href={item.href}>
              <Panel className="h-full transition hover:border-accent">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<PageFallback title="Create" />}>
      <CreateContent />
    </Suspense>
  );
}
