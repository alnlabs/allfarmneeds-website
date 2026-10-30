import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AgriMitraChat } from "@/components/agri-mitra-chat";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";

async function AgriMitraContent({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; new?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?next=/agri-mitra");

  const params = await searchParams;
  const { locale } = await getRequestLocale();
  const copy = t(locale);
  const supabase = await createClient();
  const requestedSessionId = params.session ? Number(params.session) : null;
  const forceNew = params.new === "1";

  let sessionId: number | null = null;
  if (requestedSessionId) {
    const { data } = await supabase
      .from("agri_mitra_sessions")
      .select("id, locale")
      .eq("id", requestedSessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    sessionId = data?.id ?? null;
  }

  if (!sessionId && !forceNew) {
    const { data } = await supabase
      .from("agri_mitra_sessions")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    sessionId = data?.id ?? null;
  }

  const [{ data: messages }, { data: confirmations }, { data: recentSessions }] =
    await Promise.all([
      sessionId
        ? supabase
            .from("agri_mitra_messages")
            .select("id, role, content, tool_name, tool_payload, created_at")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] }),
      sessionId
        ? supabase
            .from("agri_mitra_confirmations")
            .select("id, action_type, status, payload, result_path, error_message")
            .eq("session_id", sessionId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      supabase
        .from("agri_mitra_sessions")
        .select("id, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <PageShell
      title={copy.agriMitra}
      subtitle={
        locale === "te"
          ? "తెలుగు లేదా ఇంగ్లీష్‌లో అడగండి. మీరు నిర్ధారించే వరకు ఏమీ ప్రచురించబడదు."
          : "Ask in Telugu or English. Nothing is published until you say yes."
      }
      actions={
        <Link
          href="/agri-mitra?new=1"
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
        >
          {locale === "te" ? "కొత్త చాట్" : "New chat"}
        </Link>
      }
    >
      <Panel className="mb-4">
        <p className="text-sm text-muted">
          {locale === "te"
            ? "టైప్ చేయండి లేదా మైక్ వాడండి (బ్రౌజర్ వాయిస్ — క్లౌడ్ కాదు). వాయిస్ సర్వర్‌లో సేవ్ కాదు."
            : "Type always works. Optional mic uses your browser voice — not cloud speech. Voice is not stored on our servers."}
        </p>
        {(recentSessions ?? []).length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {(recentSessions ?? []).map((session, index) => (
              <Link
                key={session.id}
                href={`/agri-mitra?session=${session.id}`}
                className={`inline-flex min-h-9 items-center rounded-lg border px-3 py-1.5 text-xs ${
                  session.id === sessionId
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-white hover:bg-accent-soft"
                }`}
              >
                {locale === "te" ? `చాట్ ${index + 1}` : `Chat ${index + 1}`}
              </Link>
            ))}
          </div>
        ) : null}
      </Panel>
      <AgriMitraChat
        sessionId={sessionId}
        locale={locale}
        messages={(messages ?? []).map((message) => ({
          ...message,
          tool_payload:
            message.tool_payload && typeof message.tool_payload === "object"
              ? (message.tool_payload as {
                  confirmation_id?: number | null;
                  intent?: string;
                  result_path?: string;
                })
              : null,
        }))}
        pendingConfirmations={(confirmations ?? []).map((row) => ({
          ...row,
          payload:
            row.payload && typeof row.payload === "object"
              ? (row.payload as Record<string, unknown>)
              : {},
        }))}
      />
    </PageShell>
  );
}

export default function AgriMitraPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; new?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Agri Mitra" />}>
      <AgriMitraContent searchParams={searchParams} />
    </Suspense>
  );
}
