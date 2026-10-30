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

async function BuyersContent({
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
      let requirements = supabase
        .from("buyer_requirements")
        .select(
          `
          id,
          title,
          description,
          quantity,
          quantity_unit,
          expected_price,
          price_unit,
          product_categories(name_en, name_te),
          districts(name),
          villages(name),
          profiles!buyer_requirements_buyer_id_fkey(
            display_name,
            buyer_profiles(business_name, business_type)
          )
        `,
        )
        .eq("status", "published")
        .eq("moderation_status", "approved")
        .order("updated_at", { ascending: false });
      if (categoryId) requirements = requirements.eq("category_id", categoryId);
      if (query) {
        requirements = requirements.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`,
        );
      }
      return requirements;
    })(),
  ]);

  const { data: requirements, error } = listingsResult;
  const canPost =
    !!user &&
    (user.roles.includes("buyer") || user.roles.includes("retailer"));

  return (
    <PageShell
      title={copy.modules.buyersTraders.title}
      subtitle={copy.buyersBrowseSubtitle}
      actions={
        canPost ? (
          <Link
            href="/buyers/new"
            className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            {locale === "te" ? "అవసరం పోస్ట్ చేయండి" : "Post requirement"}
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
          {(requirements ?? []).length === 0 ? (
            <EmptyState
              title={
                locale === "te"
                  ? "ఇంకా ఆమోదించిన కొనుగోలు అవసరాలు లేవు."
                  : "No approved purchase needs match these filters yet."
              }
              body={
                locale === "te"
                  ? "శోధన మార్చండి లేదా తర్వాత మళ్లీ చూడండి."
                  : "Try different filters or check again later."
              }
              action={
                canPost ? (
                  <Link
                    href="/buyers/new"
                    className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                  >
                    {locale === "te" ? "అవసరం పోస్ట్ చేయండి" : "Post requirement"}
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
            <div className="grid gap-3 md:grid-cols-2">
              {requirements?.map((requirement) => {
                const category = Array.isArray(requirement.product_categories)
                  ? requirement.product_categories[0]
                  : requirement.product_categories;
                const district = Array.isArray(requirement.districts)
                  ? requirement.districts[0]
                  : requirement.districts;
                const village = Array.isArray(requirement.villages)
                  ? requirement.villages[0]
                  : requirement.villages;
                const profile = Array.isArray(requirement.profiles)
                  ? requirement.profiles[0]
                  : requirement.profiles;
                const nestedBuyer = profile
                  ? Array.isArray(profile.buyer_profiles)
                    ? profile.buyer_profiles[0]
                    : profile.buyer_profiles
                  : null;
                const eyebrow = category
                  ? locale === "te"
                    ? `${category.name_te} — ${category.name_en}`
                    : `${category.name_en} — ${category.name_te}`
                  : copy.modules.buyersTraders.title;
                const buyerType = nestedBuyer?.business_type;

                return (
                  <ListingCard
                    key={requirement.id}
                    href={`/buyers/${requirement.id}`}
                    eyebrow={
                      buyerType
                        ? `${eyebrow} · ${buyerType}`
                        : eyebrow
                    }
                    title={requirement.title}
                    description={requirement.description || undefined}
                    meta={
                      <>
                        {requirement.quantity != null ? (
                          <span>
                            {requirement.quantity}{" "}
                            {requirement.quantity_unit ?? ""}
                          </span>
                        ) : null}
                        {requirement.expected_price != null ? (
                          <span className="font-medium text-foreground">
                            {copy.expectedPrice}: ₹{requirement.expected_price}
                            {requirement.price_unit
                              ? ` / ${requirement.price_unit}`
                              : ""}
                          </span>
                        ) : null}
                        {village?.name || district?.name ? (
                          <span>{village?.name ?? district?.name}</span>
                        ) : null}
                        <span>
                          {nestedBuyer?.business_name ||
                            profile?.display_name ||
                            copy.buyer}
                        </span>
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

export default function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Purchase needs" />}>
      <BuyersContent searchParams={searchParams} />
    </Suspense>
  );
}
