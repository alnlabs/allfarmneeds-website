import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFallback } from "@/components/page-fallback";
import {
  EmptyState,
  ListingCard,
  PageShell,
  StatusBadge,
} from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { statusLabel, statusTone, t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function MessagesContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login?next=/messages");
  }

  const { locale } = await getRequestLocale();
  const copy = t(locale);
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
      title={copy.messages}
      subtitle={copy.inboxExplainer}
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(enquiries ?? []).length === 0 ? (
          <EmptyState
            title={
              locale === "te" ? "ఇంకా సందేశాలు లేవు." : "No enquiries yet."
            }
            body={
              locale === "te"
                ? "సేవలు లేదా జాబితాల నుండి సంప్రదించినప్పుడు సందేశాలు ఇక్కడ కనిపిస్తాయి."
                : "When you contact a listing, enquiries appear here. Alerts for bookings stay under Notifications in My account."
            }
            action={
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
              >
                {copy.navExplore}
              </Link>
            }
          />
        ) : (
          enquiries?.map((enquiry) => {
            const listing = Array.isArray(enquiry.service_listings)
              ? enquiry.service_listings[0]
              : enquiry.service_listings;
            const direction =
              enquiry.sender_id === user.id
                ? locale === "te"
                  ? "మీరు పంపారు"
                  : "You sent"
                : locale === "te"
                  ? "మీకు వచ్చింది"
                  : "You received";

            return (
              <ListingCard
                key={enquiry.id}
                href={`/messages/${enquiry.id}`}
                eyebrow={
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span>{direction}</span>
                    <StatusBadge tone={statusTone(enquiry.status)}>
                      {statusLabel(locale, enquiry.status)}
                    </StatusBadge>
                  </span>
                }
                title={listing?.title ?? (locale === "te" ? "సందేశం" : "Enquiry")}
                description={enquiry.message}
                meta={
                  <span>{new Date(enquiry.created_at).toLocaleString()}</span>
                }
              />
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
