import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { moderateProductListing } from "@/app/actions/products";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminCropsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
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
    .from("product_listings")
    .select(
      `
      id,
      title,
      status,
      moderation_status,
      quantity_available,
      quantity_unit,
      product_categories(name_en, name_te),
      profiles!product_listings_seller_id_fkey(display_name)
    `,
    )
    .order("updated_at", { ascending: false });
  if (filter !== "all") query = query.eq("moderation_status", filter);
  const { data: listings, error } = await query;

  return (
    <PageShell
      title="Crop moderation"
      subtitle="Approve or reject published produce listings before buyers can reserve stock."
      actions={
        <div className="flex flex-wrap gap-2 text-sm">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Link
              key={status}
              href={`/admin/crops?status=${status}`}
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
            const category = Array.isArray(listing.product_categories)
              ? listing.product_categories[0]
              : listing.product_categories;
            const seller = Array.isArray(listing.profiles)
              ? listing.profiles[0]
              : listing.profiles;
            return (
              <Panel key={listing.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Crop"}
                    </p>
                    <h2 className="text-xl font-semibold">{listing.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {seller?.display_name ?? "Seller"} ·{" "}
                      {listing.quantity_available} {listing.quantity_unit} ·{" "}
                      {listing.status} / {listing.moderation_status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/crops/${listing.id}`}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      View
                    </Link>
                    <form action={moderateProductListing}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <PrimaryButton type="submit">Approve</PrimaryButton>
                    </form>
                    <form action={moderateProductListing}>
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

export default function AdminCropsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Crop moderation" />}>
      <AdminCropsContent searchParams={searchParams} />
    </Suspense>
  );
}
