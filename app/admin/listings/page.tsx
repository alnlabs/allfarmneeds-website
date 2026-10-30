import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { moderateListing } from "@/app/actions/listings";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminListingsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const params = await searchParams;
  const filter = params.status ?? "pending";

  const supabase = await createClient();
  let query = supabase
    .from("service_listings")
    .select(
      `
      id,
      title,
      status,
      moderation_status,
      updated_at,
      service_categories(name_en, name_te),
      profiles!service_listings_provider_id_fkey(display_name, provider_profiles(business_name))
    `,
    )
    .order("updated_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("moderation_status", filter);
  }

  const { data: listings, error } = await query;

  return (
    <PageShell
      title="Listing moderation"
      subtitle="Approve or reject published service listings before they appear publicly."
      actions={
        <div className="flex flex-wrap gap-2 text-sm">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Link
              key={status}
              href={`/admin/listings?status=${status}`}
              className={`rounded-lg border px-3 py-1.5 ${
                filter === status
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-white hover:bg-accent-soft"
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
      }
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(listings ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No listings in this filter.</p>
          </Panel>
        ) : (
          listings?.map((listing) => {
            const category = Array.isArray(listing.service_categories)
              ? listing.service_categories[0]
              : listing.service_categories;
            const profile = Array.isArray(listing.profiles)
              ? listing.profiles[0]
              : listing.profiles;
            const provider = Array.isArray(profile?.provider_profiles)
              ? profile?.provider_profiles[0]
              : profile?.provider_profiles;

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
                      {provider?.business_name ?? profile?.display_name ?? "Provider"}
                      {" · "}
                      Listing: {listing.status} · Moderation: {listing.moderation_status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/services/${listing.id}`}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      View
                    </Link>
                    <form action={moderateListing}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <PrimaryButton type="submit">Approve</PrimaryButton>
                    </form>
                    <form action={moderateListing}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="decision" value="rejected" />
                      <SecondaryButton type="submit">Reject</SecondaryButton>
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

export default function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Listing moderation" />}>
      <AdminListingsContent searchParams={searchParams} />
    </Suspense>
  );
}
