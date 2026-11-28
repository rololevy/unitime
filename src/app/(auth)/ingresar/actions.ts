"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { loginEmailSchema, otpCodeSchema, safeNextPath } from "@/lib/validation/auth";
import { accreditWithLoginEmail } from "@/server/auth";

export type LoginState =
  | { step: "email"; error?: string; email?: string }
  | { step: "code"; email: string; error?: string };

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await requestOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    console.error("[auth] signInWithOAuth:", error?.message);
    redirect(`/ingresar?error=google&next=${encodeURIComponent(next)}`);
  }
  redirect(data.url);
}

export async function sendEmailCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginEmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { step: "email", error: parsed.error.issues[0]?.message, email: String(formData.get("email") ?? "") };
  }

  const captcha = formData.get("cf-turnstile-response");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: true,
      captchaToken: typeof captcha === "string" && captcha ? captcha : undefined,
    },
  });

  if (error) {
    console.error("[auth] signInWithOtp:", error.code, error.message);
    const message =
      error.code === "over_email_send_rate_limit" || error.status === 429
        ? "Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo."
        : error.code === "captcha_failed"
          ? "No pudimos confirmar que no sos un robot. Completá la verificación y volvé a intentar."
          : "No pudimos mandarte el código. Probá de nuevo en unos minutos.";
    return { step: "email", error: message, email: parsed.data };
  }

  return { step: "code", email: parsed.data };
}

export async function verifyEmailCode(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = loginEmailSchema.safeParse(formData.get("email"));
  if (!email.success) return { step: "email", error: "Volvé a ingresar tu email." };

  const code = otpCodeSchema.safeParse(formData.get("code"));
  if (!code.success) return { step: "code", email: email.data, error: code.error.issues[0]?.message };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ email: email.data, token: code.data, type: "email" });
  if (error) {
    return {
      step: "code",
      email: email.data,
      error: "El código no es válido o venció. Revisalo o pedí uno nuevo.",
    };
  }

  await accreditWithLoginEmail();
  redirect(safeNextPath(formData.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
