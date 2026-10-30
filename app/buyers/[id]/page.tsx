import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { transitionSellerResponse } from "@/app/actions/requirements";
import { SellerResponseForm } from "@/components/seller-response-form";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function BuyerRequirementDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requirementId = Number(id);
  if (!requirementId) notFound();

  const user = await requireUser();
  const isStaff =
    !!user &&
    (user.roles.includes("administrator") || user.roles.includes("moderator"));
  const supabase = await createClient();

  const { data: requirement, error } = await supabase
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
      needed_from,
      needed_until,
      status,
      moderation_status,
      buyer_id,
      product_categories(name_en, name_te),
      districts(name),
      villages(name),
      profiles!buyer_requirements_buyer_id_fkey(
        display_name,
        buyer_profiles(business_name, business_type, about)
      )
    `,
    )
    .eq("id", requirementId)
    .maybeSingle();

  const isOwner = user?.id === requirement?.buyer_id;
  const isPublic =
    !!requirement &&
    requirement.status === "published" &&
    requirement.moderation_status === "approved";

  if (error || !requirement || (!isPublic && !isOwner && !isStaff)) {
    notFound();
  }

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
  const buyerProfile = profile
    ? Array.isArray(profile.buyer_profiles)
      ? profile.buyer_profiles[0]
      : profile.buyer_profiles
    : null;

  const canOffer =
    !!user &&
    !isOwner &&
    isPublic &&
    user.roles.includes("farmer");

  const { data: responses } = user
    ? await supabase
        .from("seller_responses")
        .select(
          `
          id,
          status,
          quantity,
          quantity_unit,
          price_amount,
          price_unit,
          quality_notes,
          delivery_note,
          seller_id,
          profiles!seller_responses_seller_id_fkey(display_name)
        `,
        )
        .eq("requirement_id", requirementId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const myOffer = responses?.find((row) => row.seller_id === user?.id);

  return (
    <PageShell
      title={requirement.title}
      subtitle={
        category ? `${category.name_te} — ${category.name_en}` : "Purchase requirement"
      }
    >
      {!isPublic ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Not public yet (status: {requirement.status}, moderation:{" "}
          {requirement.moderation_status}).
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <p className="text-sm text-muted">
            {buyerProfile?.business_name || profile?.display_name || "Buyer"}
            {buyerProfile?.business_type ? ` · ${buyerProfile.business_type}` : ""}
            {village?.name || district?.name
              ? ` · ${village?.name ?? district?.name}`
              : ""}
          </p>
          <p className="mt-4 whitespace-pre-wrap">
            {requirement.description || "No description provided."}
          </p>
          {requirement.quality_notes ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
              Quality: {requirement.quality_notes}
            </p>
          ) : null}
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Quantity</dt>
              <dd className="font-medium">
                {requirement.quantity != null
                  ? `${requirement.quantity} ${requirement.quantity_unit ?? ""}`
                  : "Open"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Target price</dt>
              <dd className="font-medium">
                {requirement.expected_price != null
                  ? `₹${requirement.expected_price}${requirement.price_unit ? ` / ${requirement.price_unit}` : ""}`
                  : "Negotiable"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Needed from</dt>
              <dd className="font-medium">{requirement.needed_from || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Needed until</dt>
              <dd className="font-medium">{requirement.needed_until || "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h2 className="text-lg font-semibold">Offer supply</h2>
          <p className="mt-2 text-sm text-muted">
            Farmers can offer quantity and price. The buyer accepts or declines.
          </p>
          <div className="mt-4">
            {!user ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/buyers/${requirement.id}`)}`}
                className="inline-flex rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
              >
                Sign in to offer
              </Link>
            ) : isOwner ? (
              <Link
                href="/buyer/requirements"
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Manage my requirements
              </Link>
            ) : canOffer ? (
              myOffer && myOffer.status !== "withdrawn" ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    Your offer is <strong>{myOffer.status}</strong>
                    {myOffer.quantity != null
                      ? ` · ${myOffer.quantity} ${myOffer.quantity_unit ?? ""}`
                      : ""}
                    {myOffer.price_amount != null
                      ? ` · ₹${myOffer.price_amount}`
                      : ""}
                  </p>
                  {myOffer.status === "offered" ? (
                    <form action={transitionSellerResponse}>
                      <input type="hidden" name="response_id" value={myOffer.id} />
                      <input type="hidden" name="status" value="withdrawn" />
                      <input
                        type="hidden"
                        name="return_to"
                        value={`/buyers/${requirement.id}`}
                      />
                      <SecondaryButton type="submit">Withdraw offer</SecondaryButton>
                    </form>
                  ) : null}
                </div>
              ) : (
                <SellerResponseForm
                  requirementId={requirement.id}
                  defaultUnit={requirement.quantity_unit}
                />
              )
            ) : (
              <Link
                href={`/onboarding/roles?next=${encodeURIComponent(`/buyers/${requirement.id}`)}`}
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
              >
                Add farmer role to offer supply
              </Link>
            )}
          </div>
        </Panel>
      </div>

      {user ? (
        <div className="mt-6">
          <ReportForm
            targetType="buyer_requirement"
            targetId={requirement.id}
            returnTo={`/buyers/${requirement.id}`}
          />
        </div>
      ) : null}

      {isOwner || isStaff ? (
        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Seller offers</h2>
          {(responses ?? []).length === 0 ? (
            <Panel>
              <p className="text-muted">No offers yet.</p>
            </Panel>
          ) : (
            responses?.map((response) => {
              const seller = Array.isArray(response.profiles)
                ? response.profiles[0]
                : response.profiles;
              return (
                <Panel key={response.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {seller?.display_name ?? "Seller"}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {response.status}
                        {response.quantity != null
                          ? ` · ${response.quantity} ${response.quantity_unit ?? ""}`
                          : ""}
                        {response.price_amount != null
                          ? ` · ₹${response.price_amount}${response.price_unit ? ` / ${response.price_unit}` : ""}`
                          : ""}
                      </p>
                      {response.quality_notes ? (
                        <p className="mt-2 text-sm">{response.quality_notes}</p>
                      ) : null}
                      {response.delivery_note ? (
                        <p className="mt-1 text-sm text-muted">{response.delivery_note}</p>
                      ) : null}
                    </div>
                    {isOwner && response.status === "offered" ? (
                      <div className="flex flex-wrap gap-2">
                        <form action={transitionSellerResponse}>
                          <input type="hidden" name="response_id" value={response.id} />
                          <input type="hidden" name="status" value="accepted" />
                          <input
                            type="hidden"
                            name="return_to"
                            value={`/buyers/${requirement.id}`}
                          />
                          <PrimaryButton type="submit">Accept</PrimaryButton>
                        </form>
                        <form action={transitionSellerResponse}>
                          <input type="hidden" name="response_id" value={response.id} />
                          <input type="hidden" name="status" value="declined" />
                          <input
                            type="hidden"
                            name="return_to"
                            value={`/buyers/${requirement.id}`}
                          />
                          <SecondaryButton type="submit">Decline</SecondaryButton>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </Panel>
              );
            })
          )}
        </div>
      ) : null}
    </PageShell>
  );
}

export default function BuyerRequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Purchase requirement" />}>
      <BuyerRequirementDetailContent params={params} />
    </Suspense>
  );
}
