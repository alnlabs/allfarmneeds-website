"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseAgriIntent } from "@/lib/agri-mitra/intent";
import { runAgriTool } from "@/lib/agri-mitra/tools";
import { requireUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import { createClient } from "@/utils/supabase/server";

export type AgriMitraState = {
  error?: string;
};

async function ensureSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  locale: Locale,
  sessionIdRaw?: string | null,
) {
  const sessionId = sessionIdRaw ? Number(sessionIdRaw) : null;
  if (sessionId) {
    const { data } = await supabase
      .from("agri_mitra_sessions")
      .select("id, locale")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return data;
  }
  const { data, error } = await supabase
    .from("agri_mitra_sessions")
    .insert({
      user_id: userId,
      locale,
      title: locale === "te" ? "అగ్రి మిత్ర" : "Agri Mitra",
    })
    .select("id, locale")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not start session.");
  return data;
}

export async function sendAgriMitraMessage(
  _prev: AgriMitraState,
  formData: FormData,
): Promise<AgriMitraState> {
  const user = await requireUser();
  if (!user) redirect("/login?next=/agri-mitra");

  const message = String(formData.get("message") ?? "").trim();
  const locale = (String(formData.get("locale") ?? "en") === "te" ? "te" : "en") as Locale;
  const sessionIdRaw = String(formData.get("session_id") ?? "").trim() || null;
  if (message.length < 2) return { error: "Say or type a short request." };

  const supabase = await createClient();
  let session;
  try {
    session = await ensureSession(supabase, user.id, locale, sessionIdRaw);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Session failed." };
  }

  const { error: userMsgError } = await supabase.from("agri_mitra_messages").insert({
    session_id: session.id,
    role: "user",
    content: message,
  });
  if (userMsgError) return { error: userMsgError.message };

  const parsed = parseAgriIntent(message);
  const effectiveLocale = parsed.localeHint ?? locale;
  const tool = await runAgriTool(parsed, effectiveLocale, user.id);

  let confirmationId: number | null = null;
  if (tool.confirmation) {
    const { data: confirmation, error: confError } = await supabase
      .from("agri_mitra_confirmations")
      .insert({
        session_id: session.id,
        action_type: tool.confirmation.actionType,
        payload: tool.confirmation.payload,
        status: "pending",
      })
      .select("id")
      .single();
    if (confError) return { error: confError.message };
    confirmationId = confirmation.id;
  }

  const { error: assistantError } = await supabase.from("agri_mitra_messages").insert({
    session_id: session.id,
    role: "assistant",
    content: tool.assistantMessage,
    tool_name: tool.toolName ?? null,
    tool_payload: {
      ...(tool.toolPayload ?? {}),
      confirmation_id: confirmationId,
      intent: parsed.intent,
    },
  });
  if (assistantError) return { error: assistantError.message };

  await supabase
    .from("agri_mitra_sessions")
    .update({ locale: effectiveLocale, updated_at: new Date().toISOString() })
    .eq("id", session.id);

  revalidatePath("/agri-mitra");
  redirect(`/agri-mitra?session=${session.id}`);
}

export async function resolveAgriMitraConfirmation(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login?next=/agri-mitra");

  const confirmationId = Number(formData.get("confirmation_id"));
  const decision = String(formData.get("decision") ?? "").trim();
  const sessionId = Number(formData.get("session_id"));
  if (!confirmationId || !["confirm", "cancel"].includes(decision)) {
    redirect(sessionId ? `/agri-mitra?session=${sessionId}` : "/agri-mitra");
  }

  const supabase = await createClient();
  const { data: confirmation } = await supabase
    .from("agri_mitra_confirmations")
    .select("id, session_id, action_type, payload, status, agri_mitra_sessions!inner(user_id)")
    .eq("id", confirmationId)
    .maybeSingle();

  const sessionOwner = Array.isArray(confirmation?.agri_mitra_sessions)
    ? confirmation?.agri_mitra_sessions[0]
    : confirmation?.agri_mitra_sessions;

  if (
    !confirmation ||
    sessionOwner?.user_id !== user.id ||
    confirmation.status !== "pending"
  ) {
    redirect(sessionId ? `/agri-mitra?session=${sessionId}` : "/agri-mitra");
  }

  if (decision === "cancel") {
    await supabase
      .from("agri_mitra_confirmations")
      .update({ status: "cancelled", confirmed_at: new Date().toISOString() })
      .eq("id", confirmationId);
    await supabase.from("agri_mitra_messages").insert({
      session_id: confirmation.session_id,
      role: "assistant",
      content: "Cancelled. Nothing was published.",
    });
    redirect(`/agri-mitra?session=${confirmation.session_id}`);
  }

  const payload = (confirmation.payload ?? {}) as Record<string, unknown>;
  let resultPath = "/";
  let errorMessage = "";

  try {
    if (confirmation.action_type === "publish_farm_job") {
      if (!user.roles.includes("farmer")) {
        throw new Error("Add the farmer role before publishing a job.");
      }
      const categoryId = Number(payload.category_id);
      if (!categoryId) throw new Error("Missing job category.");
      const { data, error } = await supabase
        .from("farm_jobs")
        .insert({
          farmer_id: user.id,
          category_id: categoryId,
          title: String(payload.title ?? "Farm job"),
          description: String(payload.description ?? ""),
          workers_required: Number(payload.workers_required ?? 1),
          status: "published",
          moderation_status: "pending",
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not create job.");
      resultPath = `/jobs/${data.id}`;
    } else if (confirmation.action_type === "publish_product_listing") {
      if (!user.roles.includes("farmer")) {
        throw new Error("Add the farmer role before publishing a crop listing.");
      }
      const categoryId = Number(payload.category_id);
      if (!categoryId) throw new Error("Missing product category.");
      const { data, error } = await supabase
        .from("product_listings")
        .insert({
          seller_id: user.id,
          category_id: categoryId,
          title: String(payload.title ?? "Crop listing"),
          description: String(payload.description ?? ""),
          quantity_available: Number(payload.quantity_available ?? 0),
          quantity_unit: String(payload.quantity_unit ?? "quintal"),
          fulfillment: String(payload.fulfillment ?? "pickup"),
          status: "published",
          moderation_status: "pending",
          photo_urls: [],
        })
        .select("id")
        .single();
      if (error || !data) throw new Error(error?.message ?? "Could not create listing.");
      resultPath = `/crops/${data.id}`;
    } else {
      throw new Error("Unsupported action.");
    }

    await supabase
      .from("agri_mitra_confirmations")
      .update({
        status: "executed",
        confirmed_at: new Date().toISOString(),
        result_path: resultPath,
      })
      .eq("id", confirmationId);

    await supabase.from("agri_mitra_messages").insert({
      session_id: confirmation.session_id,
      role: "assistant",
      content: `Published for staff review. Open ${resultPath}`,
      tool_name: confirmation.action_type,
      tool_payload: { result_path: resultPath },
    });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Action failed.";
    await supabase
      .from("agri_mitra_confirmations")
      .update({
        status: "failed",
        confirmed_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", confirmationId);
    await supabase.from("agri_mitra_messages").insert({
      session_id: confirmation.session_id,
      role: "assistant",
      content: `Could not publish: ${errorMessage}`,
    });
  }

  revalidatePath("/agri-mitra");
  redirect(`/agri-mitra?session=${confirmation.session_id}`);
}
