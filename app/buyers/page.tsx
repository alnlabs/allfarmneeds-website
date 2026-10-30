import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, Select } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function BuyersContent({
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
          quality_notes,
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
      if (categoryId) query = query.eq("category_id", categoryId);
      return query;
    })(),
  ]);

  const { data: requirements, error } = listingsResult;
  const canPost =
    !!user &&
    (user.roles.includes("buyer") || user.roles.includes("retailer"));

  return (
    <PageShell
      title={copy.modules.buyersTraders.title}
      subtitle={
        locale === "te"
          ? "ఆమోదించిన కొనుగోలు అవసరాలు చూడండి మరియు సరఫరా ఆఫర్ పంపండి."
          : "Browse approved purchase requirements and send supply offers."
      }
      actions={
        canPost ? (
          <Link
            href="/buyers/new"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            {locale === "te" ? "అవసరం పోస్ట్ చేయండి" : "Post requirement"}
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
        {(requirements ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">
              {locale === "te"
                ? "ఇంకా ఆమోదించిన కొనుగోలు అవసరాలు లేవు."
                : "No approved purchase requirements match these filters yet."}
            </p>
          </Panel>
        ) : (
          requirements?.map((requirement) => {
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

            return (
              <Link
                key={requirement.id}
                href={`/buyers/${requirement.id}`}
                className="block rounded-2xl border border-border bg-white p-5 transition hover:border-accent"
              >
                <p className="text-sm text-muted">
                  {category
                    ? locale === "te"
                      ? `${category.name_te} — ${category.name_en}`
                      : `${category.name_en} — ${category.name_te}`
                    : copy.modules.buyersTraders.title}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{requirement.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {requirement.description || "—"}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
                  {requirement.quantity != null ? (
                    <span>
                      {requirement.quantity} {requirement.quantity_unit ?? ""}
                    </span>
                  ) : null}
                  {requirement.expected_price != null ? (
                    <span>
                      ₹{requirement.expected_price}
                      {requirement.price_unit ? ` / ${requirement.price_unit}` : ""}
                    </span>
                  ) : null}
                  {village?.name || district?.name ? (
                    <span>{village?.name ?? district?.name}</span>
                  ) : null}
                  <span>
                    {nestedBuyer?.business_name || profile?.display_name || "Buyer"}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Buyers & Traders" />}>
      <BuyersContent searchParams={searchParams} />
    </Suspense>
  );
}
