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

export default function HomePage() {
  return (
    <PageShell
      title="AllFarmNeeds"
      subtitle="Find tractors, labour and farm services in Telangana. Providers can publish listings and receive enquiries."
      actions={
        <div className="flex flex-wrap gap-3">
          <Link
            href="/services"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            Browse services
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            Offer a service
          </Link>
        </div>
      }
    >
      <Panel>
        <h2 className="mb-4 text-lg font-semibold">Service categories</h2>
        <Suspense fallback={<p className="text-muted">Loading categories…</p>}>
          <FeaturedCategories />
        </Suspense>
      </Panel>
    </PageShell>
  );
}
