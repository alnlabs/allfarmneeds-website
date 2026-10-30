import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, Select } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function CropsContent({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
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
      let query = supabase
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
      if (categoryId) query = query.eq("category_id", categoryId);
      return query;
    })(),
  ]);

  const { data: listings, error } = listingsResult;

  return (
    <PageShell
      title={copy.modules.cropMarketplace.title}
      subtitle={
        locale === "te"
          ? "ఆమోదించిన పంట జాబితాలు చూడండి మరియు పరిమాణం రిజర్వ్ చేయండి."
          : "Browse approved crop listings and reserve quantity safely."
      }
      actions={
        user?.roles.includes("farmer") ? (
          <Link
            href="/crops/new"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            {locale === "te" ? "పంట జాబితా" : "Sell produce"}
          </Link>
        ) : null
      }
    >
      <Panel>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
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
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong sm:w-auto"
            >
              {copy.applyFilters}
            </button>
          </div>
        </form>
      </Panel>

      <div className="mt-6 space-y-3">
        {error ? <p className="text-red-700">{error.message}</p> : null}
        {(listings ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">
              {locale === "te"
                ? "ఇంకా ఆమోదించిన పంట జాబితాలు లేవు."
                : "No approved crop listings match these filters yet."}
            </p>
          </Panel>
        ) : (
          listings?.map((listing) => {
            const category = Array.isArray(listing.product_categories)
              ? listing.product_categories[0]
              : listing.product_categories;
            const village = Array.isArray(listing.villages)
              ? listing.villages[0]
              : listing.villages;
            const seller = Array.isArray(listing.profiles)
              ? listing.profiles[0]
              : listing.profiles;
            const photo = listing.photo_urls?.[0];

            return (
              <Link
                key={listing.id}
                href={`/crops/${listing.id}`}
                className="flex gap-4 rounded-2xl border border-border bg-white p-5 transition hover:border-accent"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    className="hidden h-24 w-24 shrink-0 rounded-xl object-cover sm:block"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted">
                    {category
                      ? locale === "te"
                        ? `${category.name_te} — ${category.name_en}`
                        : `${category.name_en} — ${category.name_te}`
                      : copy.modules.cropMarketplace.title}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{listing.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {listing.description || "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                    <span>
                      {listing.quantity_available} {listing.quantity_unit}
                    </span>
                    {listing.expected_price != null ? (
                      <span>
                        ₹{listing.expected_price}
                        {listing.price_unit ? ` / ${listing.price_unit}` : ""}
                      </span>
                    ) : null}
                    {listing.quality_grade ? <span>{listing.quality_grade}</span> : null}
                    {village?.name ? <span>{village.name}</span> : null}
                    <span>{seller?.display_name ?? "Seller"}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function CropsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Crop Marketplace" />}>
      <CropsContent searchParams={searchParams} />
    </Suspense>
  );
}
