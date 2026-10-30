import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { closeEnquiry } from "@/app/actions/enquiries";
import { EnquiryReplyForm } from "@/components/enquiry-reply-form";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
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
  const [{ data: enquiry }, { data: replies }] = await Promise.all([
    supabase
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
        farm_job_id,
        product_listing_id,
        buyer_requirement_id,
        service_listings(title),
        sender:profiles!enquiries_sender_id_fkey(display_name),
        recipient:profiles!enquiries_recipient_id_fkey(display_name)
      `,
      )
      .eq("id", enquiryId)
      .maybeSingle(),
    supabase
      .from("enquiry_messages")
      .select(
        `
        id,
        body,
        created_at,
        sender_id,
        profiles!enquiry_messages_sender_id_fkey(display_name)
      `,
      )
      .eq("enquiry_id", enquiryId)
      .order("created_at", { ascending: true }),
  ]);

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

  const subjectHref = enquiry.service_listing_id
    ? `/services/${enquiry.service_listing_id}`
    : enquiry.farm_job_id
      ? `/jobs/${enquiry.farm_job_id}`
      : enquiry.product_listing_id
        ? `/crops/${enquiry.product_listing_id}`
        : enquiry.buyer_requirement_id
          ? `/buyers/${enquiry.buyer_requirement_id}`
          : null;

  return (
    <PageShell
      title={listing?.title ?? "Enquiry"}
      subtitle={`${enquiry.status} · ${new Date(enquiry.created_at).toLocaleString()}`}
      actions={
        subjectHref ? (
          <Link
            href={subjectHref}
            className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
          >
            View subject
          </Link>
        ) : null
      }
    >
      <div className="space-y-3">
        <Panel>
          <p className="text-sm text-muted">
            From {sender?.display_name || "User"} to{" "}
            {recipient?.display_name || "User"}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-lg">{enquiry.message}</p>
        </Panel>

        {(replies ?? []).map((reply) => {
          const author = Array.isArray(reply.profiles)
            ? reply.profiles[0]
            : reply.profiles;
          const mine = reply.sender_id === user.id;
          return (
            <Panel key={reply.id} className={mine ? "bg-accent-soft/20" : undefined}>
              <p className="text-sm text-muted">
                {author?.display_name || "User"} ·{" "}
                {new Date(reply.created_at).toLocaleString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{reply.body}</p>
            </Panel>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {enquiry.status === "open" ? (
          <Panel>
            <EnquiryReplyForm enquiryId={enquiry.id} />
            <form action={closeEnquiry} className="mt-4">
              <input type="hidden" name="enquiry_id" value={enquiry.id} />
              <SecondaryButton type="submit">Mark closed</SecondaryButton>
            </form>
          </Panel>
        ) : (
          <p className="text-sm text-muted">This enquiry is closed.</p>
        )}
        <ReportForm
          targetType="enquiry"
          targetId={enquiry.id}
          returnTo={`/messages/${enquiry.id}`}
        />
      </div>
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
