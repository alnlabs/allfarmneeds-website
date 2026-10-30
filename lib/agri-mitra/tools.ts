import type { Locale } from "@/lib/locale";
import type { ParsedIntent } from "@/lib/agri-mitra/intent";
import { createClient } from "@/utils/supabase/server";

export type ToolResult = {
  assistantMessage: string;
  toolName?: string;
  toolPayload?: Record<string, unknown>;
  confirmation?: {
    actionType: "publish_farm_job" | "publish_product_listing";
    payload: Record<string, unknown>;
    summaryEn: string;
    summaryTe: string;
  };
};

function copy(locale: Locale, en: string, te: string) {
  return locale === "te" ? te : en;
}

async function categoryIdBySlug(
  table: "service_categories" | "job_categories" | "product_categories",
  slug: string | null,
  fallbackSlug: string,
) {
  const supabase = await createClient();
  const wanted = slug ?? fallbackSlug;
  const { data } = await supabase
    .from(table)
    .select("id, slug, name_en, name_te")
    .eq("slug", wanted)
    .maybeSingle();
  if (data) return data;
  const { data: fallback } = await supabase
    .from(table)
    .select("id, slug, name_en, name_te")
    .eq("slug", fallbackSlug)
    .maybeSingle();
  return fallback;
}

export async function runAgriTool(
  intent: ParsedIntent,
  locale: Locale,
  userId: string,
): Promise<ToolResult> {
  const supabase = await createClient();

  if (intent.intent === "help" || intent.intent === "unknown") {
    return {
      assistantMessage: copy(
        locale,
        "I can help you: find farm services, draft a farm job, draft a crop listing, find buyer requirements, or read your inbox. Say it in Telugu or English. I will always ask before publishing.",
        "నేను సహాయం చేయగలను: వ్యవసాయ సేవలు వెతకడం, ఉద్యోగం డ్రాఫ్ట్, పంట జాబితా డ్రాఫ్ట్, కొనుగోలు అవసరాలు, లేదా మీ ఇన్‌బాక్స్. తెలుగు లేదా ఇంగ్లీష్‌లో చెప్పండి. ప్రచురించే ముందు తప్పనిసరిగా నిర్ధారణ అడుగుతాను.",
      ),
      toolName: "help",
    };
  }

  if (intent.intent === "search_services") {
    const category = await categoryIdBySlug(
      "service_categories",
      intent.serviceHint,
      "tractor-rental",
    );
    let query = supabase
      .from("service_listings")
      .select("id, title, expected_price, price_unit, villages(name)")
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("updated_at", { ascending: false })
      .limit(5);
    if (category) query = query.eq("category_id", category.id);
    const { data } = await query;
    const lines =
      (data ?? []).map((row) => {
        const village = Array.isArray(row.villages) ? row.villages[0] : row.villages;
        return `• ${row.title}${village?.name ? ` (${village.name})` : ""} → /services/${row.id}`;
      }) ?? [];
    return {
      assistantMessage:
        lines.length > 0
          ? copy(
              locale,
              `Found ${lines.length} approved service(s)${category ? ` in ${category.name_en}` : ""}:\n${lines.join("\n")}`,
              `${lines.length} ఆమోదించిన సేవలు${category ? ` (${category.name_te})` : ""}:\n${lines.join("\n")}`,
            )
          : copy(
              locale,
              "No approved services matched. Try another service name, or browse /services.",
              "సరిపోయే ఆమోదించిన సేవలు లేవు. మరొక సేవ పేరు చెప్పండి లేదా /services చూడండి.",
            ),
      toolName: "search_services",
      toolPayload: {
        category_slug: category?.slug ?? null,
        count: lines.length,
      },
    };
  }

  if (intent.intent === "search_buyers") {
    const category = await categoryIdBySlug(
      "product_categories",
      intent.cropHint,
      "cotton",
    );
    let query = supabase
      .from("buyer_requirements")
      .select("id, title, quantity, quantity_unit, districts(name)")
      .eq("status", "published")
      .eq("moderation_status", "approved")
      .order("updated_at", { ascending: false })
      .limit(5);
    if (category) query = query.eq("category_id", category.id);
    const { data } = await query;
    const lines =
      (data ?? []).map((row) => {
        const district = Array.isArray(row.districts) ? row.districts[0] : row.districts;
        return `• ${row.title}${row.quantity != null ? ` · ${row.quantity} ${row.quantity_unit ?? ""}` : ""}${district?.name ? ` · ${district.name}` : ""} → /buyers/${row.id}`;
      }) ?? [];
    return {
      assistantMessage:
        lines.length > 0
          ? copy(
              locale,
              `Buyer requirements${category ? ` for ${category.name_en}` : ""}:\n${lines.join("\n")}`,
              `కొనుగోలు అవసరాలు${category ? ` (${category.name_te})` : ""}:\n${lines.join("\n")}`,
            )
          : copy(
              locale,
              "No approved buyer requirements matched. Browse /buyers.",
              "సరిపోయే అవసరాలు లేవు. /buyers చూడండి.",
            ),
      toolName: "search_buyers",
      toolPayload: { count: lines.length },
    };
  }

  if (intent.intent === "read_inbox") {
    const [{ count: enquiries }, { count: bookings }, { count: applications }] =
      await Promise.all([
        supabase
          .from("enquiries")
          .select("id", { count: "exact", head: true })
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .eq("status", "open"),
        supabase
          .from("service_bookings")
          .select("id", { count: "exact", head: true })
          .or(`farmer_id.eq.${userId},provider_id.eq.${userId}`)
          .in("status", ["requested", "accepted", "scheduled", "in_progress"]),
        supabase
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("worker_id", userId)
          .eq("status", "submitted"),
      ]);
    return {
      assistantMessage: copy(
        locale,
        `Inbox snapshot: ${enquiries ?? 0} open messages, ${bookings ?? 0} active bookings, ${applications ?? 0} open applications. Open /messages, /bookings, or /worker/applications.`,
        `ఇన్‌బాక్స్: ${enquiries ?? 0} సందేశాలు, ${bookings ?? 0} బుకింగ్‌లు, ${applications ?? 0} దరఖాస్తులు. /messages, /bookings లేదా /worker/applications చూడండి.`,
      ),
      toolName: "read_inbox",
      toolPayload: {
        enquiries: enquiries ?? 0,
        bookings: bookings ?? 0,
        applications: applications ?? 0,
      },
    };
  }

  if (intent.intent === "draft_farm_job") {
    const category = await categoryIdBySlug(
      "job_categories",
      intent.jobHint,
      "other",
    );
    const workers = intent.workers ?? 10;
    const title =
      locale === "te"
        ? `${category?.name_te ?? "పొలం పని"} — ${workers} మంది`
        : `${category?.name_en ?? "Farm work"} — ${workers} workers`;
    const description =
      locale === "te"
        ? `Agri Mitra డ్రాఫ్ట్. అసలు అభ్యర్థన: ${intent.query}`
        : `Draft from Agri Mitra. Original request: ${intent.query}`;
    const payload = {
      category_id: category?.id ?? null,
      title,
      description,
      workers_required: workers,
      status: "published",
    };
    return {
      assistantMessage: copy(
        locale,
        `I prepared a farm job draft. Review and confirm to publish for staff moderation:\n• Title: ${title}\n• Workers: ${workers}\n• Category: ${category?.name_en ?? "Other"}`,
        `ఉద్యోగ డ్రాఫ్ట్ సిద్ధం. ప్రచురించడానికి నిర్ధారించండి (స్టాఫ్ మోడరేషన్):\n• శీర్షిక: ${title}\n• కూలీలు: ${workers}\n• వర్గం: ${category?.name_te ?? "ఇతర"}`,
      ),
      toolName: "draft_farm_job",
      toolPayload: payload,
      confirmation: {
        actionType: "publish_farm_job",
        payload,
        summaryEn: title,
        summaryTe: title,
      },
    };
  }

  if (intent.intent === "draft_product_listing") {
    const category = await categoryIdBySlug(
      "product_categories",
      intent.cropHint,
      "paddy",
    );
    const quantity = intent.quantity ?? 20;
    const title =
      locale === "te"
        ? `${category?.name_te ?? "పంట"} — ${quantity} క్వింటాల్`
        : `${category?.name_en ?? "Produce"} — ${quantity} quintals`;
    const description =
      locale === "te"
        ? `Agri Mitra డ్రాఫ్ట్. అసలు అభ్యర్థన: ${intent.query}`
        : `Draft from Agri Mitra. Original request: ${intent.query}`;
    const payload = {
      category_id: category?.id ?? null,
      title,
      description,
      quantity_available: quantity,
      quantity_unit: "quintal",
      status: "published",
      fulfillment: "pickup",
    };
    return {
      assistantMessage: copy(
        locale,
        `I prepared a crop listing draft. Confirm to publish for staff moderation:\n• Title: ${title}\n• Quantity: ${quantity} quintal\n• Category: ${category?.name_en ?? "Paddy"}`,
        `పంట జాబితా డ్రాఫ్ట్ సిద్ధం. ప్రచురించడానికి నిర్ధారించండి:\n• శీర్షిక: ${title}\n• పరిమాణం: ${quantity} క్వింటాల్\n• వర్గం: ${category?.name_te ?? "వరి"}`,
      ),
      toolName: "draft_product_listing",
      toolPayload: payload,
      confirmation: {
        actionType: "publish_product_listing",
        payload,
        summaryEn: title,
        summaryTe: title,
      },
    };
  }

  return {
    assistantMessage: copy(
      locale,
      "I did not understand that yet. Try: find tractor, need 10 workers for cotton, sell 20 quintals paddy, or read my messages.",
      "అర్థం కాలేదు. ఉదాహరణ: ట్రాక్టర్ కావాలి, పత్తికి 10 మంది కూలీలు, 20 క్వింటాల్ వరి అమ్మాలి, లేదా నా సందేశాలు.",
    ),
  };
}
