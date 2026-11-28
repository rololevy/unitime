import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

/** Rutas que requieren sesión. El resto del sitio (la landing) sigue estático. */
const PROTECTED_PREFIXES = ["/inicio"];

/**
 * Renueva la sesión de Supabase (cookies) y redirige al login si una ruta
 * privada no tiene sesión. Es un chequeo optimista: cada página y acción
 * vuelve a validar la sesión en el servidor.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabasePublicConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, String(value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  if (isProtected && !data?.claims) {
    const login = request.nextUrl.clone();
    login.pathname = "/ingresar";
    login.search = "";
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/inicio/:path*", "/ingresar", "/auth/:path*"],
};
