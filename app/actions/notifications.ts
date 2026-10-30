"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const notificationId = Number(formData.get("notification_id"));
  const linkPath = safeInternalPath(String(formData.get("link_path") ?? "/notifications"));
  if (!notificationId) redirect("/notifications");

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .is("read_at", null);

  redirect(linkPath);
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  redirect("/notifications");
}
