"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser, type AppRole } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

const selectableRoles: AppRole[] = [
  "farmer",
  "worker",
  "service_provider",
  "buyer",
];

export type RoleActionState = {
  error?: string;
};

export async function saveRoles(
  _prev: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const selected = selectableRoles.filter((role) => formData.get(role) === "on");
  if (selected.length === 0) {
    return { error: "Choose at least one role to continue." };
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const villageId = Number(formData.get("village_id") || 0) || null;
  const about = String(formData.get("about") ?? "").trim();
  const next = safeInternalPath(String(formData.get("next") ?? ""));
  const supabase = await createClient();

  if (displayName) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    if (profileError) {
      return { error: profileError.message };
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (existingError) {
    return { error: existingError.message };
  }

  const existingSelectable = (existing ?? [])
    .map((row) => row.role as AppRole)
    .filter((role) => selectableRoles.includes(role));

  const toRemove = existingSelectable.filter((role) => !selected.includes(role));
  const toAdd = selected.filter((role) => !existingSelectable.includes(role));

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user.id)
      .in("role", toRemove);
    if (error) {
      return { error: error.message };
    }
  }

  if (toAdd.length > 0) {
    const { error } = await supabase.from("user_roles").insert(
      toAdd.map((role) => ({
        user_id: user.id,
        role,
      })),
    );
    if (error) {
      return { error: error.message };
    }
  }

  if (selected.includes("farmer")) {
    const { error } = await supabase.from("farmer_profiles").upsert({
      user_id: user.id,
      village_id: villageId,
      about,
    });
    if (error) {
      return { error: error.message };
    }
  }

  if (selected.includes("service_provider")) {
    redirect(`/provider/profile?next=${encodeURIComponent(next)}`);
  }

  if (selected.includes("worker")) {
    redirect(`/worker/profile?next=${encodeURIComponent(next)}`);
  }

  if (selected.includes("buyer")) {
    redirect(`/buyer/profile?next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
