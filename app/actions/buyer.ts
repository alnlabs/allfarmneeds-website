"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export type BuyerActionState = {
  error?: string;
};

const BUSINESS_TYPES = [
  "individual",
  "trader",
  "wholesaler",
  "retailer",
  "restaurant",
  "processor",
  "other",
] as const;

export async function saveBuyerProfile(
  _prev: BuyerActionState,
  formData: FormData,
): Promise<BuyerActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("buyer") && !user.roles.includes("retailer")) {
    redirect("/onboarding/roles?next=/buyer/profile");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  const businessType = String(formData.get("business_type") ?? "individual").trim();
  const about = String(formData.get("about") ?? "").trim();
  const districtIds = formData
    .getAll("district_id")
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id) && id > 0);
  const next = safeInternalPath(String(formData.get("next") ?? ""));

  if (!businessName) return { error: "Business or buyer name is required." };
  if (!BUSINESS_TYPES.includes(businessType as (typeof BUSINESS_TYPES)[number])) {
    return { error: "Invalid business type." };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("buyer_profiles").upsert({
    user_id: user.id,
    business_name: businessName,
    business_type: businessType,
    about,
  });
  if (profileError) return { error: profileError.message };

  const { error: clearError } = await supabase
    .from("buyer_operating_areas")
    .delete()
    .eq("buyer_id", user.id);
  if (clearError) return { error: clearError.message };

  if (districtIds.length > 0) {
    const unique = [...new Set(districtIds)];
    const { error: areasError } = await supabase.from("buyer_operating_areas").insert(
      unique.map((district_id) => ({
        buyer_id: user.id,
        district_id,
        mandal_id: null,
        village_id: null,
      })),
    );
    if (areasError) return { error: areasError.message };
  }

  redirect(next === "/" ? "/buyer/requirements" : next);
}
