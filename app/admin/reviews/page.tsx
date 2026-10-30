import { Suspense } from "react";
import { redirect } from "next/navigation";
import { moderateReview } from "@/app/actions/reviews";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminReviewsContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      entity_type,
      entity_id,
      rating,
      comment,
      status,
      created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(display_name),
      reviewee:profiles!reviews_reviewee_id_fkey(display_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <PageShell
      title="Reviews moderation"
      subtitle="Hide abusive reviews without deleting history."
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(reviews ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No reviews yet.</p>
          </Panel>
        ) : (
          reviews?.map((review) => {
            const reviewer = Array.isArray(review.reviewer)
              ? review.reviewer[0]
              : review.reviewer;
            const reviewee = Array.isArray(review.reviewee)
              ? review.reviewee[0]
              : review.reviewee;
            return (
              <Panel key={review.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {review.entity_type} #{review.entity_id} · {review.rating}/5 ·{" "}
                      {review.status}
                    </p>
                    <p className="mt-1 text-sm">
                      {reviewer?.display_name ?? "Reviewer"} →{" "}
                      {reviewee?.display_name ?? "Reviewee"}
                    </p>
                    {review.comment ? (
                      <p className="mt-2 whitespace-pre-wrap">{review.comment}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.status === "visible" ? (
                      <form action={moderateReview}>
                        <input type="hidden" name="review_id" value={review.id} />
                        <input type="hidden" name="status" value="hidden" />
                        <SecondaryButton type="submit">Hide</SecondaryButton>
                      </form>
                    ) : (
                      <form action={moderateReview}>
                        <input type="hidden" name="review_id" value={review.id} />
                        <input type="hidden" name="status" value="visible" />
                        <PrimaryButton type="submit">Show</PrimaryButton>
                      </form>
                    )}
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

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<PageFallback title="Reviews moderation" />}>
      <AdminReviewsContent />
    </Suspense>
  );
}
