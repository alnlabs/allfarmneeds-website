import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function MessagesContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select(
      `
      id,
      message,
      status,
      created_at,
      sender_id,
      recipient_id,
      service_listings(title)
    `,
    )
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <PageShell
      title="Messages"
      subtitle="Enquiries between farmers and service providers."
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(enquiries ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No enquiries yet.</p>
          </Panel>
        ) : (
          enquiries?.map((enquiry) => {
            const listing = Array.isArray(enquiry.service_listings)
              ? enquiry.service_listings[0]
              : enquiry.service_listings;
            const direction =
              enquiry.sender_id === user.id ? "You sent" : "You received";

            return (
              <Link
                key={enquiry.id}
                href={`/messages/${enquiry.id}`}
                className="block rounded-2xl border border-border bg-white p-5 hover:border-accent"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
                  <span>
                    {direction} · {enquiry.status}
                  </span>
                  <span>{new Date(enquiry.created_at).toLocaleString()}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold">
                  {listing?.title ?? "Service enquiry"}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {enquiry.message}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<PageFallback title="Messages" />}>
      <MessagesContent />
    </Suspense>
  );
}
