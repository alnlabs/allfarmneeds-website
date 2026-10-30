import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { transitionSellerResponse } from "@/app/actions/requirements";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function BuyerRequirementsContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("buyer") && !user.roles.includes("retailer")) {
    redirect("/onboarding/roles?next=/buyer/requirements");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: requirements }, { data: responses }] = await Promise.all([
    supabase
      .from("buyer_requirements")
      .select(
        "id, title, status, moderation_status, quantity, quantity_unit, expected_price, product_categories(name_en, name_te)",
      )
      .eq("buyer_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
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
        buyer_requirements!inner(id, title, buyer_id),
        profiles!seller_responses_seller_id_fkey(display_name)
      `,
      )
      .eq("buyer_requirements.buyer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <PageShell
      title="My purchase requirements"
      subtitle="Publish what you need and review seller offers."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/buyer/profile"
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            Buyer profile
          </Link>
          <Link
            href="/buyers/new"
            className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
          >
            New requirement
          </Link>
        </div>
      }
    >
      {params.error ? <p className="mb-4 text-sm text-red-700">{params.error}</p> : null}

      <div className="space-y-3">
        {(requirements ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No requirements yet.</p>
          </Panel>
        ) : (
          requirements?.map((requirement) => {
            const category = Array.isArray(requirement.product_categories)
              ? requirement.product_categories[0]
              : requirement.product_categories;
            return (
              <Panel key={requirement.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Requirement"}
                    </p>
                    <h2 className="text-xl font-semibold">{requirement.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {requirement.quantity != null
                        ? `${requirement.quantity} ${requirement.quantity_unit ?? ""} · `
                        : ""}
                      Status: {requirement.status} · Moderation:{" "}
                      {requirement.moderation_status}
                    </p>
                  </div>
                  <Link
                    href={`/buyers/${requirement.id}`}
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
        <h2 className="text-lg font-semibold">Incoming offers</h2>
        {(responses ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No offers yet.</p>
          </Panel>
        ) : (
          responses?.map((response) => {
            const requirement = Array.isArray(response.buyer_requirements)
              ? response.buyer_requirements[0]
              : response.buyer_requirements;
            const seller = Array.isArray(response.profiles)
              ? response.profiles[0]
              : response.profiles;
            return (
              <Panel key={response.id}>
                <h3 className="font-semibold">{requirement?.title ?? "Requirement"}</h3>
                <p className="mt-1 text-sm text-muted">
                  Seller: {seller?.display_name ?? "—"} · {response.status}
                  {response.quantity != null
                    ? ` · ${response.quantity} ${response.quantity_unit ?? ""}`
                    : ""}
                  {response.price_amount != null
                    ? ` · ₹${response.price_amount}`
                    : ""}
                </p>
                {response.quality_notes ? (
                  <p className="mt-2 text-sm">{response.quality_notes}</p>
                ) : null}
                {response.status === "offered" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={transitionSellerResponse}>
                      <input type="hidden" name="response_id" value={response.id} />
                      <input type="hidden" name="status" value="accepted" />
                      <input type="hidden" name="return_to" value="/buyer/requirements" />
                      <PrimaryButton type="submit">Accept</PrimaryButton>
                    </form>
                    <form action={transitionSellerResponse}>
                      <input type="hidden" name="response_id" value={response.id} />
                      <input type="hidden" name="status" value="declined" />
                      <input type="hidden" name="return_to" value="/buyer/requirements" />
                      <SecondaryButton type="submit">Decline</SecondaryButton>
                    </form>
                  </div>
                ) : null}
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function BuyerRequirementsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="My purchase requirements" />}>
      <BuyerRequirementsContent searchParams={searchParams} />
    </Suspense>
  );
}
