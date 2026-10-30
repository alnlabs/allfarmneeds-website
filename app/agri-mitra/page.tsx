import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AgriMitraChat } from "@/components/agri-mitra-chat";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
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

  const [{ data: messages }, { data: confirmations }] = await Promise.all([
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
  ]);

  return (
    <PageShell
      title={locale === "te" ? "అగ్రి మిత్ర" : "Agri Mitra"}
      subtitle={
        locale === "te"
          ? "వాయిస్ లేదా టెక్స్ట్‌తో సేవలు, ఉద్యోగాలు, పంటలు. ప్రచురణకు ముందు నిర్ధారణ తప్పనిసరి."
          : "Voice or text for services, jobs and crops. Confirmation is required before publish."
      }
      actions={
        <Link
          href="/agri-mitra?new=1"
          className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
        >
          {locale === "te" ? "కొత్త చాట్" : "New chat"}
        </Link>
      }
    >
      <Panel className="mb-4">
        <p className="text-sm text-muted">
          {locale === "te"
            ? "డెమో ఇంటెంట్ రూటర్ (EN/TE). STT/TTS బ్రౌజర్ Web Speech API ద్వారా — బాహ్య API కీ లేదు. రచనలు మీ సైన్-ఇన్ వినియోగదారు RLS కింద జరుగుతాయి."
            : "Demo intent router (EN/TE). STT/TTS uses the browser Web Speech API — no external API key. Writes run as your signed-in user under RLS."}
        </p>
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
