import * as z from "zod";

export const loginEmailSchema = z
  .string({ error: "Ingresá tu email." })
  .trim()
  .toLowerCase()
  .max(254, { error: "El email es demasiado largo." })
  .pipe(z.email({ error: "Revisá el email: no parece válido." }));

export const otpCodeSchema = z
  .string({ error: "Ingresá el código." })
  .trim()
  .regex(/^\d{6}$/, { error: "El código tiene 6 números." });

const DEFAULT_NEXT = "/inicio";

/**
 * Destino después del login. Solo acepta rutas internas ("/algo"); descarta URLs
 * externas y trucos como "//evil.com" o "/\evil.com" para evitar redirecciones
 * abiertas.
 */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return DEFAULT_NEXT;
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return DEFAULT_NEXT;
  if (/[\u0000-\u001f]/.test(value)) return DEFAULT_NEXT;
  try {
    const url = new URL(value, "https://campustime.invalid");
    if (url.origin !== "https://campustime.invalid") return DEFAULT_NEXT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT;
  }
}
