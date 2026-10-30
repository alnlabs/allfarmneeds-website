import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DealForm } from "@/components/deal-form";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function CropDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = Number(id);
  if (!listingId) notFound();

  const user = await requireUser();
  const isStaff =
    !!user &&
    (user.roles.includes("administrator") || user.roles.includes("moderator"));
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("product_listings")
    .select(
      `
      id,
      title,
      description,
      quantity_available,
      quantity_unit,
      expected_price,
      price_unit,
      quality_grade,
      minimum_order_quantity,
      fulfillment,
      photo_urls,
      status,
      moderation_status,
      seller_id,
      product_categories(name_en, name_te),
      villages(name),
      profiles!product_listings_seller_id_fkey(display_name)
    `,
    )
    .eq("id", listingId)
    .maybeSingle();

  const isOwner = user?.id === listing?.seller_id;
  const isPublic =
    !!listing &&
    ["published", "partially_sold"].includes(listing.status) &&
    listing.moderation_status === "approved";

  if (error || !listing || (!isPublic && !isOwner && !isStaff)) {
    notFound();
  }

  const category = Array.isArray(listing.product_categories)
    ? listing.product_categories[0]
    : listing.product_categories;
  const village = Array.isArray(listing.villages) ? listing.villages[0] : listing.villages;
  const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
  const photos: string[] = listing.photo_urls ?? [];
  const canBuy =
    !!user &&
    !isOwner &&
    isPublic &&
    listing.quantity_available > 0 &&
    (user.roles.includes("buyer") ||
      user.roles.includes("retailer") ||
      user.roles.includes("farmer"));

  return (
    <PageShell
      title={listing.title}
      subtitle={
        category ? `${category.name_te} — ${category.name_en}` : "Crop listing"
      }
    >
      {!isPublic ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Not public yet (status: {listing.status}, moderation:{" "}
          {listing.moderation_status}).
        </p>
      ) : null}

      {photos.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="h-36 w-full rounded-2xl border border-border object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <p className="text-sm text-muted">
            {seller?.display_name ?? "Seller"}
            {village?.name ? ` · ${village.name}` : ""}
          </p>
          <p className="mt-4 whitespace-pre-wrap">
            {listing.description || "No description provided."}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Available</dt>
              <dd className="font-medium">
                {listing.quantity_available} {listing.quantity_unit}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="font-medium">
                {listing.expected_price != null
                  ? `₹${listing.expected_price}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
                  : "On enquiry"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Grade</dt>
              <dd className="font-medium">{listing.quality_grade || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Fulfillment</dt>
              <dd className="font-medium">{listing.fulfillment}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Reserve quantity</h2>
          <p className="mt-2 text-sm text-muted">
            Stock is held atomically so two buyers cannot oversell the same quantity.
          </p>
          <div className="mt-4">
            {!user ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/crops/${listing.id}`)}`}
                className="inline-flex rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
              >
                Sign in to buy
              </Link>
            ) : isOwner ? (
              <Link
                href="/seller/crops"
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Manage my listings
              </Link>
            ) : canBuy ? (
              <DealForm
                listingId={listing.id}
                quantityUnit={listing.quantity_unit}
                maxQuantity={Number(listing.quantity_available)}
                minimumOrder={listing.minimum_order_quantity}
              />
            ) : (
              <Link
                href={`/onboarding/roles?next=${encodeURIComponent(`/crops/${listing.id}`)}`}
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Add buyer or farmer role to reserve
              </Link>
            )}
          </div>
        </Panel>
      </div>

      {user ? (
        <div className="mt-6">
          <ReportForm
            targetType="product_listing"
            targetId={listing.id}
            returnTo={`/crops/${listing.id}`}
          />
        </div>
      ) : null}
    </PageShell>
  );
}

export default function CropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Crop listing" />}>
      <CropDetailContent params={params} />
    </Suspense>
  );
}
