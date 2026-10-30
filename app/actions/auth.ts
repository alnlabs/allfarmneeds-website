"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSiteUrl } from "@/lib/site";

export type AuthActionState = {
  error?: string;
  success?: string;
  email?: string;
  step?: "email" | "code";
};

export async function sendLoginCode(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address.", step: "email" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, step: "email", email };
  }

  return {
    success: "Check your email for a login code or magic link.",
    email,
    step: "code",
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

  if (!email || !token) {
    return {
      error: "Enter the email and the code from your inbox.",
      step: "code",
      email,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message, step: "code", email };
  }

  redirect("/onboarding/roles");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
