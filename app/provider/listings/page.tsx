import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { deleteListing } from "@/app/actions/listings";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function ProviderListingsContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/provider/profile");
  }

  const { data: listings } = await supabase
    .from("service_listings")
    .select(
      "id, title, status, price_amount, price_unit, service_categories(name_en, name_te)",
    )
    .eq("provider_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <PageShell
      title="My service listings"
      subtitle="Publish tractor, labour and other farm services for farmers to discover."
      actions={
        <Link
          href="/provider/listings/new"
          className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
        >
          New listing
        </Link>
      }
    >
      <div className="space-y-3">
        {(listings ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No listings yet. Create your first service.</p>
          </Panel>
        ) : (
          listings?.map((listing) => {
            const category = Array.isArray(listing.service_categories)
              ? listing.service_categories[0]
              : listing.service_categories;

            return (
              <Panel key={listing.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Service"}
                    </p>
                    <h2 className="text-xl font-semibold">{listing.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Status: {listing.status}
                      {listing.price_amount != null
                        ? ` · ₹${listing.price_amount}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/provider/listings/${listing.id}/edit`}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      Edit
                    </Link>
                    <form action={deleteListing}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <SecondaryButton type="submit">Delete</SecondaryButton>
                    </form>
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function ProviderListingsPage() {
  return (
    <Suspense fallback={<PageFallback title="My service listings" />}>
      <ProviderListingsContent />
    </Suspense>
  );
}
