import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Inicio",
  robots: { index: false },
};

export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-muted">Cargando…</p>}>
      <Welcome />
    </Suspense>
  );
}

async function Welcome() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar?next=/inicio");

  const active = user.affiliations.filter((a) => a.status === "active");
  const pending = user.affiliations.some((a) => a.status === "pending_domain");
  const name = user.displayName.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{name ? `¡Hola, ${name}!` : "¡Hola!"}</h1>
        <p className="mt-2 text-muted">Entraste como {user.email}.</p>
      </div>

      <section aria-labelledby="acreditacion" className="rounded-2xl border border-border p-6">
        <h2 id="acreditacion" className="font-semibold">
          Acreditación
        </h2>
        {active.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {active.map((a, index) => (
              <li key={index} className="text-muted">
                <span className="font-medium text-success">✓ Acreditado</span> en {a.institution}
                {a.campus ? ` – ${a.campus}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">
            {pending
              ? "Tu universidad todavía no está registrada. Te avisamos cuando la sumemos."
              : "Todavía no estás acreditado. Pronto vas a poder verificar tu mail institucional desde acá."}
          </p>
        )}
      </section>
    </div>
  );
}
