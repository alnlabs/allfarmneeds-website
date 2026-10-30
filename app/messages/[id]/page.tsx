import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { closeEnquiry } from "@/app/actions/enquiries";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function MessageDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const enquiryId = Number(id);
  if (!enquiryId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: enquiry } = await supabase
    .from("enquiries")
    .select(
      `
      id,
      message,
      status,
      created_at,
      sender_id,
      recipient_id,
      service_listing_id,
      service_listings(title),
      sender:profiles!enquiries_sender_id_fkey(display_name),
      recipient:profiles!enquiries_recipient_id_fkey(display_name)
    `,
    )
    .eq("id", enquiryId)
    .maybeSingle();

  if (
    !enquiry ||
    (enquiry.sender_id !== user.id && enquiry.recipient_id !== user.id)
  ) {
    notFound();
  }

  const listing = Array.isArray(enquiry.service_listings)
    ? enquiry.service_listings[0]
    : enquiry.service_listings;
  const sender = Array.isArray(enquiry.sender)
    ? enquiry.sender[0]
    : enquiry.sender;
  const recipient = Array.isArray(enquiry.recipient)
    ? enquiry.recipient[0]
    : enquiry.recipient;

  return (
    <PageShell
      title={listing?.title ?? "Enquiry"}
      subtitle={`${enquiry.status} · ${new Date(enquiry.created_at).toLocaleString()}`}
      actions={
        enquiry.service_listing_id ? (
          <Link
            href={`/services/${enquiry.service_listing_id}`}
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            View listing
          </Link>
        ) : null
      }
    >
      <Panel>
        <p className="text-sm text-muted">
          From {sender?.display_name || "User"} to{" "}
          {recipient?.display_name || "User"}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-lg">{enquiry.message}</p>
        {enquiry.status === "open" ? (
          <form action={closeEnquiry} className="mt-6">
            <input type="hidden" name="enquiry_id" value={enquiry.id} />
            <SecondaryButton type="submit">Mark closed</SecondaryButton>
          </form>
        ) : null}
      </Panel>
    </PageShell>
  );
}

export default function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Enquiry" />}>
      <MessageDetailContent params={params} />
    </Suspense>
  );
}
