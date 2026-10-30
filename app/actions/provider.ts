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
  const { error: profileError } = await supabase.from("provider_profiles").upsert({
    user_id: user.id,
    business_name: businessName,
    about,
    logo_url: logoUrl,
    // Public columns intentionally left null — numbers live in private contacts.
    phone: null,
    whatsapp: null,
    show_contact_publicly: showContactPublicly,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  const { error: contactError } = await supabase
    .from("provider_private_contacts")
    .upsert({
      user_id: user.id,
      phone,
      whatsapp,
    });

  if (contactError) {
    return { error: contactError.message };
  }

  redirect(next === "/" ? "/provider/listings" : next);
}
