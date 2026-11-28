import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validation/auth";
import { accreditWithLoginEmail } from "@/server/auth";

/** Vuelta de Google: canjea el código por una sesión y acredita si el email es institucional. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await accreditWithLoginEmail();
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error("[auth] exchangeCodeForSession:", error.message);
  }

  return NextResponse.redirect(new URL(`/ingresar?error=google&next=${encodeURIComponent(next)}`, origin));
}
