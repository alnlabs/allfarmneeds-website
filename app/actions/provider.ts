"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type ProviderActionState = {
  error?: string;
  success?: string;
};

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

  if (!businessName) {
    return { error: "Business name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("provider_profiles").upsert({
    user_id: user.id,
    business_name: businessName,
    about,
    logo_url: logoUrl,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/provider/listings");
}
