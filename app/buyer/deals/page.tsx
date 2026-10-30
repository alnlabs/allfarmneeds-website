import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { transitionProductDeal } from "@/app/actions/products";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function BuyerDealsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const supabase = await createClient();
  const { data: deals, error } = await supabase
    .from("product_deals")
    .select(
      `
      id,
      status,
      quantity,
      quantity_unit,
      price_amount,
      message,
      seller_id,
      product_listings(id, title),
      profiles!product_deals_seller_id_fkey(display_name)
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

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
      title="My crop deals"
      subtitle="Reserved stock is held until you complete or cancel the deal."
      actions={
        <Link
          href="/crops"
          className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
        >
          Browse crops
        </Link>
      }
    >
      {params.error ? <p className="mb-4 text-sm text-red-700">{params.error}</p> : null}
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(deals ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No deals yet.</p>
          </Panel>
        ) : (
          deals?.map((deal) => {
            const listing = Array.isArray(deal.product_listings)
              ? deal.product_listings[0]
              : deal.product_listings;
            const seller = Array.isArray(deal.profiles)
              ? deal.profiles[0]
              : deal.profiles;
            return (
              <Panel key={deal.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {listing?.title ?? "Crop listing"}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Seller: {seller?.display_name ?? "—"} · {deal.quantity}{" "}
                      {deal.quantity_unit} · {deal.status}
                      {deal.price_amount != null ? ` · ₹${deal.price_amount}` : ""}
                    </p>
                    {deal.message ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm">{deal.message}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing?.id ? (
                      <Link
                        href={`/crops/${listing.id}`}
                        className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                      >
                        View listing
                      </Link>
                    ) : null}
                    {deal.status === "reserved" || deal.status === "accepted" ? (
                      <>
                        <form action={transitionProductDeal}>
                          <input type="hidden" name="deal_id" value={deal.id} />
                          <input type="hidden" name="status" value="completed" />
                          <input type="hidden" name="return_to" value="/buyer/deals" />
                          <PrimaryButton type="submit">Mark completed</PrimaryButton>
                        </form>
                        <form action={transitionProductDeal}>
                          <input type="hidden" name="deal_id" value={deal.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <input type="hidden" name="return_to" value="/buyer/deals" />
                          <SecondaryButton type="submit">Cancel / release</SecondaryButton>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
                {(deal.status === "accepted" || deal.status === "completed") &&
                !reviewed.has(deal.id) ? (
                  <ReviewForm
                    entityType="product_deal"
                    entityId={deal.id}
                    revieweeId={deal.seller_id}
                    revieweeLabel={seller?.display_name ?? "seller"}
                    returnTo="/buyer/deals"
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

export default function BuyerDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="My crop deals" />}>
      <BuyerDealsContent searchParams={searchParams} />
    </Suspense>
  );
}
