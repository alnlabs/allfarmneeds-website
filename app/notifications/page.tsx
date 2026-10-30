import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import { PageFallback } from "@/components/page-fallback";
import {
  EmptyState,
  PageShell,
  Panel,
  SecondaryButton,
} from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function NotificationsContent() {
  const user = await requireUser();
  if (!user) redirect("/login?next=/notifications");

  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const supabase = await createClient();
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      "id, type, title_en, title_te, body_en, body_te, link_path, read_at, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <PageShell
      title={copy.notifications}
      subtitle={copy.inboxExplainer}
      actions={
        <form action={markAllNotificationsRead}>
          <SecondaryButton type="submit" className="min-h-11">
            {copy.markAllRead}
          </SecondaryButton>
        </form>
      }
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(notifications ?? []).length === 0 ? (
          <EmptyState
            title={copy.noNotifications}
            body={copy.inboxExplainer}
            action={
              <Link
                href="/messages"
                className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
              >
                {copy.messages}
              </Link>
            }
          />
        ) : (
          notifications?.map((item) => {
            const title = locale === "te" ? item.title_te : item.title_en;
            const body = locale === "te" ? item.body_te : item.body_en;
            const unread = !item.read_at;
            return (
              <Panel
                key={item.id}
                className={unread ? "border-accent bg-accent-soft/30" : undefined}
              >
                <form
                  action={markNotificationRead}
                  className="flex flex-wrap items-start justify-between gap-3"
                >
                  <input type="hidden" name="notification_id" value={item.id} />
                  <input type="hidden" name="link_path" value={item.link_path} />
                  <div>
                    <p className="text-sm text-muted">
                      {item.type}
                      {unread ? ` · ${copy.notificationNew}` : ""} ·{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{title}</h2>
                    {body ? (
                      <p className="mt-2 text-sm text-muted">{body}</p>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                  >
                    {copy.openNotification}
                  </button>
                </form>
              </Panel>
            );
          })
        )}
      </div>
      <p className="mt-6 text-sm text-muted">
        <Link href="/messages" className="underline-offset-2 hover:underline">
          {copy.messages}
        </Link>
        {" · "}
        {copy.inboxExplainer}
      </p>
    </PageShell>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<PageFallback title="Notifications" />}>
      <NotificationsContent />
    </Suspense>
  );
}
