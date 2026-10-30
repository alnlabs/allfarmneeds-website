import Link from "next/link";
import { Suspense } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { PageFallback } from "@/components/page-fallback";
import {
  EmptyState,
  ListingCard,
  PageShell,
  Select,
  TextInput,
} from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function CropsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const query = params.q?.trim() || undefined;
  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: categories }, listingsResult] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    (async () => {
      let listings = supabase
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
          photo_urls,
          quality_grade,
          product_categories(name_en, name_te),
          villages(name),
          profiles!product_listings_seller_id_fkey(display_name)
        `,
        )
        .in("status", ["published", "partially_sold"])
        .eq("moderation_status", "approved")
        .order("updated_at", { ascending: false });
      if (categoryId) listings = listings.eq("category_id", categoryId);
      if (query) {
        listings = listings.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`,
        );
      }
      return listings;
    })(),
  ]);

  const { data: listings, error } = listingsResult;

  return (
    <PageShell
      title={copy.modules.cropMarketplace.title}
      subtitle={copy.cropsBrowseSubtitle}
      actions={
        user?.roles.includes("farmer") ? (
          <Link
            href="/crops/new"
            className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            {locale === "te" ? "పంట జాబితా" : "Sell produce"}
          </Link>
        ) : null
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_1fr]">
        <FilterPanel title={copy.filters}>
          <form className="grid gap-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.search}</span>
              <TextInput
                name="q"
                defaultValue={query ?? ""}
                placeholder={copy.searchPlaceholder}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.category}</span>
              <Select name="category" defaultValue={categoryId ?? ""}>
                <option value="">{copy.allCategories}</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {locale === "te"
                      ? `${category.name_te} — ${category.name_en}`
                      : `${category.name_en} — ${category.name_te}`}
                  </option>
                ))}
              </Select>
            </label>
            <button
              type="submit"
              className="min-h-11 w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.applyFilters}
            </button>
          </form>
        </FilterPanel>

        <div className="space-y-3">
          {error ? <p className="text-red-700">{error.message}</p> : null}
          {(listings ?? []).length === 0 ? (
            <EmptyState
              title={
                locale === "te"
                  ? "ఇంకా ఆమోదించిన పంట జాబితాలు లేవు."
                  : "No approved crop listings match these filters yet."
              }
              body={
                locale === "te"
                  ? "శోధన మార్చండి లేదా తర్వాత మళ్లీ చూడండి."
                  : "Try different filters or check again later."
              }
              action={
                user?.roles.includes("farmer") ? (
                  <Link
                    href="/crops/new"
                    className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                  >
                    {locale === "te" ? "పంట జాబితా" : "Sell produce"}
                  </Link>
                ) : (
                  <Link
                    href="/explore"
                    className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
                  >
                    {copy.browseMarketplace}
                  </Link>
                )
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {listings?.map((listing) => {
                const category = Array.isArray(listing.product_categories)
                  ? listing.product_categories[0]
                  : listing.product_categories;
                const village = Array.isArray(listing.villages)
                  ? listing.villages[0]
                  : listing.villages;
                const seller = Array.isArray(listing.profiles)
                  ? listing.profiles[0]
                  : listing.profiles;
                const eyebrow = category
                  ? locale === "te"
                    ? `${category.name_te} — ${category.name_en}`
                    : `${category.name_en} — ${category.name_te}`
                  : copy.modules.cropMarketplace.title;

                return (
                  <ListingCard
                    key={listing.id}
                    href={`/crops/${listing.id}`}
                    eyebrow={eyebrow}
                    title={listing.title}
                    description={listing.description || undefined}
                    imageUrl={listing.photo_urls?.[0]}
                    meta={
                      <>
                        <span>
                          {copy.availableQty}: {listing.quantity_available}{" "}
                          {listing.quantity_unit}
                        </span>
                        {listing.expected_price != null ? (
                          <span className="font-medium text-foreground">
                            {copy.expectedPrice}: ₹{listing.expected_price}
                            {listing.price_unit
                              ? ` / ${listing.price_unit}`
                              : ""}
                          </span>
                        ) : (
                          <span>{copy.priceOnEnquiry}</span>
                        )}
                        {listing.quality_grade ? (
                          <span>{listing.quality_grade}</span>
                        ) : null}
                        {village?.name ? <span>{village.name}</span> : null}
                        <span>{seller?.display_name ?? copy.seller}</span>
                      </>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

export default function CropsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Sell Crops" />}>
      <CropsContent searchParams={searchParams} />
    </Suspense>
  );
}
