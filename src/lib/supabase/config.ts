/**
 * Configuración pública de Supabase (URL y clave publicable). No es secreta,
 * pero se lee en runtime cuando está disponible (`SUPABASE_URL`,
 * `SUPABASE_PUBLISHABLE_KEY`) para que una misma imagen sirva en varios
 * entornos. Sin `server-only`: la usa también `proxy.ts`.
 */
export function getSupabasePublicConfig(): { url: string; publishableKey: string } | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}
