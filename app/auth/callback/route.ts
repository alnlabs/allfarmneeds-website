import { NextResponse } from "next/server";
import type { AppRole } from "@/lib/auth";
import { pathAfterRoles, safeInternalPath } from "@/lib/redirect";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeInternalPath(searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getClaims();
      const userId = data?.claims?.sub;
      if (userId) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        const roleList = (roles ?? []).map((row) => row.role as AppRole);
        if (!roleList.length) {
          return NextResponse.redirect(
            `${origin}/onboarding/roles?next=${encodeURIComponent(next)}`,
          );
        }
        return NextResponse.redirect(
          `${origin}${pathAfterRoles(roleList, next)}`,
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email",
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(
        `${origin}/onboarding/roles?next=${encodeURIComponent(next)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
