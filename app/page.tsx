import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { PageShell, Panel } from "@/components/ui";

async function FeaturedCategories() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("service_categories")
    .select("id, slug, name_en, name_te")
    .order("name_en");

  if (error) {
    return <p className="text-red-700">{error.message}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {categories?.map((category) => (
        <Link
          key={category.id}
          href={`/services?category=${category.id}`}
          className="rounded-2xl border border-border bg-surface p-4 transition hover:border-accent"
        >
          <p className="font-medium">{category.name_te}</p>
          <p className="text-sm text-muted">{category.name_en}</p>
        </Link>
      ))}
    </div>
  );
}

const modules = [
  {
    href: "/services",
    title: "Farm Services",
    te: "వ్యవసాయ సేవలు",
    body: "Tractors, labour, irrigation and more near your village.",
    live: true,
  },
  {
    href: null,
    title: "Farm Jobs",
    te: "వ్యవసాయ ఉద్యోగాలు",
    body: "Hire and find farm workers. Coming next.",
    live: false,
  },
  {
    href: null,
    title: "Crop Marketplace",
    te: "పంట మార్కెట్",
    body: "Buy and sell crops. Coming next.",
    live: false,
  },
  {
    href: null,
    title: "Buyers & Traders",
    te: "కొనుగోలుదారులు & వ్యాపారులు",
    body: "Connect with traders and buyers. Coming next.",
    live: false,
  },
] as const;

export default function HomePage() {
  return (
    <PageShell
      title="AllFarmNeeds"
      subtitle="Everything farmers need. One platform. Find agricultural services across Telangana and Andhra Pradesh."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/services"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            Browse Farm Services
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            Sign in / Register
          </Link>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((module) =>
          module.live && module.href ? (
            <Link
              key={module.title}
              href={module.href}
              className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
            >
              <p className="text-sm text-muted">{module.te}</p>
              <h2 className="mt-1 text-xl font-semibold">{module.title}</h2>
              <p className="mt-2 text-sm text-muted">{module.body}</p>
            </Link>
          ) : (
            <div
              key={module.title}
              className="rounded-2xl border border-dashed border-border bg-surface/70 p-5"
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
          <h2 className="mb-4 text-lg font-semibold">Service categories</h2>
          <Suspense fallback={<p className="text-muted">Loading categories…</p>}>
            <FeaturedCategories />
          </Suspense>
        </Panel>
      </div>
    </PageShell>
  );
}
