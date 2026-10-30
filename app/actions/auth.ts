"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { pathAfterRoles, safeInternalPath } from "@/lib/redirect";
import { getSiteUrl } from "@/lib/site";

export type AuthActionState = {
  error?: string;
  success?: string;
  email?: string;
  step?: "email" | "code";
  next?: string;
};

export async function sendLoginCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeInternalPath(String(formData.get("next") ?? ""));

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", step: "email", next };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message, step: "email", email, next };
  }

  return {
    success: "Check your email for a login code or magic link.",
    email,
    step: "code",
    next,
  };
}

export async function verifyLoginCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("token") ?? "").trim();
  const next = safeInternalPath(String(formData.get("next") ?? ""));

  if (!email || !token) {
    return {
      error: "Enter the email and the code from your inbox.",
      step: "code",
      email,
      next,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message, step: "code", email, next };
  }

  const user = await requireUser();
  if (!user || user.roles.length === 0) {
    redirect(`/onboarding/roles?next=${encodeURIComponent(next)}`);
  }

  redirect(pathAfterRoles(user.roles, next));
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeInternalPath(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=google&next=${encodeURIComponent(next)}${
        error?.message
          ? `&message=${encodeURIComponent(error.message)}`
          : ""
      }`,
    );
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
