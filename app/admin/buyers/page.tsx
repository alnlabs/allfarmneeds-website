import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { moderateBuyerRequirement } from "@/app/actions/requirements";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminBuyersContent({
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
    .from("buyer_requirements")
    .select(
      `
      id,
      title,
      status,
      moderation_status,
      quantity,
      quantity_unit,
      product_categories(name_en, name_te),
      profiles!buyer_requirements_buyer_id_fkey(display_name)
    `,
    )
    .order("updated_at", { ascending: false });
  if (filter !== "all") query = query.eq("moderation_status", filter);
  const { data: requirements, error } = await query;

  return (
    <PageShell
      title="Buyer requirement moderation"
      subtitle="Approve or reject published purchase requirements before sellers can offer."
      actions={
        <div className="flex flex-wrap gap-2 text-sm">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <Link
              key={status}
              href={`/admin/buyers?status=${status}`}
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
        {(requirements ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No requirements in this filter.</p>
          </Panel>
        ) : (
          requirements?.map((requirement) => {
            const category = Array.isArray(requirement.product_categories)
              ? requirement.product_categories[0]
              : requirement.product_categories;
            const buyer = Array.isArray(requirement.profiles)
              ? requirement.profiles[0]
              : requirement.profiles;
            return (
              <Panel key={requirement.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {category
                        ? `${category.name_te} — ${category.name_en}`
                        : "Requirement"}
                    </p>
                    <h2 className="text-xl font-semibold">{requirement.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {buyer?.display_name ?? "Buyer"} ·{" "}
                      {requirement.quantity != null
                        ? `${requirement.quantity} ${requirement.quantity_unit ?? ""} · `
                        : ""}
                      {requirement.status} / {requirement.moderation_status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/buyers/${requirement.id}`}
                      className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      View
                    </Link>
                    <form action={moderateBuyerRequirement}>
                      <input
                        type="hidden"
                        name="requirement_id"
                        value={requirement.id}
                      />
                      <input type="hidden" name="decision" value="approved" />
                      <PrimaryButton type="submit">Approve</PrimaryButton>
                    </form>
                    <form action={moderateBuyerRequirement}>
                      <input
                        type="hidden"
                        name="requirement_id"
                        value={requirement.id}
                      />
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

export default function AdminBuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Buyer requirement moderation" />}>
      <AdminBuyersContent searchParams={searchParams} />
    </Suspense>
  );
}
