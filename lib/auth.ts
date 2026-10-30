import { createClient } from "@/utils/supabase/server";

export type AppRole =
  | "farmer"
  | "worker"
  | "labour_contractor"
  | "service_provider"
  | "buyer"
  | "retailer"
  | "agricultural_professional"
  | "administrator"
  | "moderator";

export async function getSessionUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) {
    return null;
  }
  return {
    id: data.claims.sub as string,
    email: (data.claims.email as string | undefined) ?? null,
  };
}

export async function getUserRoles(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    return [] as AppRole[];
  }

  return (data ?? []).map((row) => row.role as AppRole);
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  const roles = await getUserRoles(user.id);
  return { ...user, roles };
}
