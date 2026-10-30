"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export type ProviderActionState = {
  error?: string;
  success?: string;
};

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  return digits || null;
}

export async function saveProviderProfile(
  _prev: ProviderActionState,
  formData: FormData,
): Promise<ProviderActionState> {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const whatsapp = normalizePhone(String(formData.get("whatsapp") ?? ""));
  const showContactPublicly = formData.get("show_contact_publicly") === "on";
  const next = safeInternalPath(String(formData.get("next") ?? ""));

  if (!businessName) {
    return { error: "Business name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("provider_profiles").upsert({
    user_id: user.id,
    business_name: businessName,
    about,
    logo_url: logoUrl,
    phone,
    whatsapp,
    show_contact_publicly: showContactPublicly,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(next === "/" ? "/provider/listings" : next);
}
