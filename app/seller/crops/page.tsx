import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { transitionProductDeal } from "@/app/actions/products";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function SellerCropsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/seller/crops");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: listings }, { data: deals }] = await Promise.all([
    supabase
      .from("product_listings")
      .select(
        "id, title, status, moderation_status, quantity_available, quantity_unit, expected_price, product_categories(name_en, name_te)",
      )
      .eq("seller_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("product_deals")
      .select(
        `
        id,
        status,
        quantity,
        quantity_unit,
        price_amount,
        message,
        buyer_id,
        product_listings(id, title),
        profiles!product_deals_buyer_id_fkey(display_name)
      `,
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const reviewableIds = (deals ?? [])
    .filter((d) => d.status === "accepted" || d.status === "completed")
    .map((d) => d.id);
  const { data: existingReviews } =
    reviewableIds.length > 0
      ? await supabase
          .from("reviews")
          .select("entity_id")
          .eq("reviewer_id", user.id)
          .eq("entity_type", "product_deal")
          .in("entity_id", reviewableIds)
      : { data: [] };
  const reviewed = new Set((existingReviews ?? []).map((r) => r.entity_id));

  return (
    <PageShell
      title="My crop listings"
      subtitle="Publish produce and manage reserved deals."
      actions={
        <Link
          href="/crops/new"
          className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
        >
          New listing
        </Link>
      }
    >
      {params.error ? <p className="mb-4 text-sm text-red-700">{params.error}</p> : null}

      <div className="space-y-3">
        {(listings ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No crop listings yet.</p>
          </Panel>
        ) : (
          listings?.map((listing) => {
            const category = Array.isArray(listing.product_categories)
              ? listing.product_categories[0]
              : listing.product_categories;
            return (
              <Panel key={listing.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Crop"}
                    </p>
                    <h2 className="text-xl font-semibold">{listing.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {listing.quantity_available} {listing.quantity_unit} · Status:{" "}
                      {listing.status} · Moderation: {listing.moderation_status}
                    </p>
                  </div>
                  <Link
                    href={`/crops/${listing.id}`}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                  >
                    View
                  </Link>
                </div>
              </Panel>
            );
          })
        )}
      </div>

      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Incoming deals</h2>
        {(deals ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No deals yet.</p>
          </Panel>
        ) : (
          deals?.map((deal) => {
            const listing = Array.isArray(deal.product_listings)
              ? deal.product_listings[0]
              : deal.product_listings;
            const buyer = Array.isArray(deal.profiles)
              ? deal.profiles[0]
              : deal.profiles;
            return (
              <Panel key={deal.id}>
                <h3 className="font-semibold">{listing?.title ?? "Listing"}</h3>
                <p className="mt-1 text-sm text-muted">
                  Buyer: {buyer?.display_name ?? "—"} · {deal.quantity}{" "}
                  {deal.quantity_unit} · {deal.status}
                  {deal.price_amount != null ? ` · ₹${deal.price_amount}` : ""}
                </p>
                {deal.message ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm">{deal.message}</p>
                ) : null}
                {deal.status === "reserved" || deal.status === "accepted" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {deal.status === "reserved" ? (
                      <>
                        <form action={transitionProductDeal}>
                          <input type="hidden" name="deal_id" value={deal.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <input type="hidden" name="return_to" value="/seller/crops" />
                          <PrimaryButton type="submit">Accept</PrimaryButton>
                        </form>
                        <form action={transitionProductDeal}>
                          <input type="hidden" name="deal_id" value={deal.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <input type="hidden" name="return_to" value="/seller/crops" />
                          <SecondaryButton type="submit">Reject</SecondaryButton>
                        </form>
                      </>
                    ) : null}
                    <form action={transitionProductDeal}>
                      <input type="hidden" name="deal_id" value={deal.id} />
                      <input type="hidden" name="status" value="completed" />
                      <input type="hidden" name="return_to" value="/seller/crops" />
                      <PrimaryButton type="submit">Complete</PrimaryButton>
                    </form>
                    <form action={transitionProductDeal}>
                      <input type="hidden" name="deal_id" value={deal.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <input type="hidden" name="return_to" value="/seller/crops" />
                      <SecondaryButton type="submit">Cancel / release</SecondaryButton>
                    </form>
                  </div>
                ) : null}
                {(deal.status === "accepted" || deal.status === "completed") &&
                !reviewed.has(deal.id) ? (
                  <ReviewForm
                    entityType="product_deal"
                    entityId={deal.id}
                    revieweeId={deal.buyer_id}
                    revieweeLabel={buyer?.display_name ?? "buyer"}
                    returnTo="/seller/crops"
                  />
                ) : null}
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function SellerCropsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="My crop listings" />}>
      <SellerCropsContent searchParams={searchParams} />
    </Suspense>
  );
}
