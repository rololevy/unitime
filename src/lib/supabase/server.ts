import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "./config";

/**
 * Cliente de Supabase con la sesión de la persona (cookies). Respeta RLS.
 * Se crea uno nuevo por request; nunca se comparte entre requests.
 */
export async function createServerSupabase() {
  // Primero las cookies: en el prerender esto marca el punto donde la página
  // pasa a resolverse en cada request, antes de validar la configuración.
  const cookieStore = await cookies();

  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error("Faltan SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Revisá .env.example.");
  }
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Los Server Components no pueden escribir cookies; proxy.ts renueva la sesión.
        }
      },
    },
  });
}
