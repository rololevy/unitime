import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

export type Affiliation = {
  status: "pending_domain" | "active" | "revoked";
  institution: string | null;
  campus: string | null;
};

export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string;
  affiliations: Affiliation[];
};

type AffiliationRow = {
  status: Affiliation["status"];
  institutions: { name: string; short_name: string | null } | null;
  campuses: { name: string; short_name: string | null } | null;
};

/**
 * Persona con sesión, o `null`. Valida el JWT (getClaims) en vez de confiar en
 * la cookie. Lee la sesión: llamala dentro de un <Suspense>.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const [profile, affiliations] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", claims.sub).maybeSingle(),
    supabase
      .from("affiliations")
      .select("status, institutions(name, short_name), campuses(name, short_name)")
      .eq("user_id", claims.sub)
      .neq("status", "revoked")
      .returns<AffiliationRow[]>(),
  ]);

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    displayName: profile.data?.display_name ?? "",
    affiliations: (affiliations.data ?? []).map((row) => ({
      status: row.status,
      institution: row.institutions?.short_name ?? row.institutions?.name ?? null,
      campus: row.campuses?.short_name ?? row.campuses?.name ?? null,
    })),
  };
}

/**
 * Si la persona entró con un email institucional confirmado, la acredita.
 * No falla el login si algo sale mal: la acreditación se puede repetir después.
 */
export async function accreditWithLoginEmail(): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("accredit_login_email");
  if (error) console.error("[auth] accredit_login_email:", error.code, error.message);
}
