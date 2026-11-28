"use client";

import Link from "next/link";
import { useActionState } from "react";

import { siteConfig } from "@/config/site";
import {
  MEMBER_ROLES,
  ROLE_LABELS,
  type WaitlistField,
  type WaitlistFormState,
} from "@/lib/validation/waitlist";

import { submitWaitlist } from "../actions";
import { TurnstileWidget } from "@/components/turnstile-widget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const initialState: WaitlistFormState = { status: "idle" };

const inputClass =
  "block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base text-foreground shadow-xs placeholder:text-muted/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40 aria-invalid:border-danger";

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(submitWaitlist, initialState);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-success/30 bg-background p-6 sm:p-8">
        <p className="text-lg font-semibold">¡Listo, ya estás en la lista!</p>
        <p className="mt-2 text-muted">
          Te vamos a escribir cuando abramos en tu facultad. Si tu email ya estaba anotado, no tenés que hacer
          nada más.
        </p>
        <p className="mt-4 text-sm text-muted">
          ¿Conocés a alguien que podría enseñar o aprender? Pasale el link: cuanta más gente haya en tu sede,
          antes abrimos.
        </p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errorProps = (field: WaitlistField, hintId?: string) => {
    const describedBy = [hintId, errors[field] ? `${field}-error` : undefined].filter(Boolean).join(" ");
    return {
      ...(errors[field] ? { "aria-invalid": true as const } : {}),
      ...(describedBy ? { "aria-describedby": describedBy } : {}),
    };
  };

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            defaultValue={values.email}
            placeholder="vos@tu-universidad.edu.ar"
            className={inputClass}
            {...errorProps("email", "email-hint")}
          />
          <FieldHint id="email-hint">
            Si usás el de tu universidad, detectamos la sede. Si no, sirve cualquier email.
          </FieldHint>
          <FieldError field="email" errors={errors} />
        </div>

        <div>
          <label htmlFor="universityName" className="mb-1.5 block text-sm font-medium">
            Universidad
          </label>
          <input
            id="universityName"
            name="universityName"
            required
            maxLength={120}
            defaultValue={values.universityName}
            placeholder="Universidad Tecnológica Nacional"
            className={inputClass}
            {...errorProps("universityName")}
          />
          <FieldError field="universityName" errors={errors} />
        </div>

        <div>
          <label htmlFor="campusName" className="mb-1.5 block text-sm font-medium">
            Sede o facultad <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            id="campusName"
            name="campusName"
            maxLength={120}
            defaultValue={values.campusName}
            placeholder="Ej.: FR General Pacheco"
            className={inputClass}
            {...errorProps("campusName")}
          />
          <FieldError field="campusName" errors={errors} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="roleType" className="mb-1.5 block text-sm font-medium">
            Sos… <span className="font-normal text-muted">(opcional)</span>
          </label>
          <select
            // Un <select> solo aplica defaultValue al montarse: la key lo vuelve a
            // montar para no perder la opción elegida si el servidor devuelve errores.
            key={values.roleType ?? ""}
            id="roleType"
            name="roleType"
            defaultValue={values.roleType ?? ""}
            className={inputClass}
            {...errorProps("roleType")}
          >
            <option value="">Prefiero no decirlo</option>
            {MEMBER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <FieldError field="roleType" errors={errors} />
        </div>

        <div>
          <label htmlFor="wantsToTeach" className="mb-1.5 block text-sm font-medium">
            Puedo enseñar <span className="font-normal text-muted">(opcional)</span>
          </label>
          <textarea
            id="wantsToTeach"
            name="wantsToTeach"
            rows={3}
            maxLength={300}
            defaultValue={values.wantsToTeach}
            placeholder="Ej.: Análisis Matemático I, Python, inglés"
            className={inputClass}
            {...errorProps("wantsToTeach")}
          />
          <FieldError field="wantsToTeach" errors={errors} />
        </div>

        <div>
          <label htmlFor="wantsToLearn" className="mb-1.5 block text-sm font-medium">
            Quiero aprender <span className="font-normal text-muted">(opcional)</span>
          </label>
          <textarea
            id="wantsToLearn"
            name="wantsToLearn"
            rows={3}
            maxLength={300}
            defaultValue={values.wantsToLearn}
            placeholder="Ej.: Física II, Excel, guitarra"
            className={inputClass}
            {...errorProps("wantsToLearn")}
          />
          <FieldError field="wantsToLearn" errors={errors} />
        </div>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            defaultChecked={values.consent === "on"}
            className="mt-1 size-4 shrink-0 accent-primary"
            {...errorProps("consent")}
          />
          <label htmlFor="consent" className="text-sm text-muted">
            Acepto que {siteConfig.name} guarde estos datos para avisarme del lanzamiento, según la{" "}
            <Link href="/privacidad" className="font-medium text-primary underline underline-offset-2">
              política de privacidad
            </Link>
            .
          </label>
        </div>
        <FieldError field="consent" errors={errors} />
      </div>

      {TURNSTILE_SITE_KEY ? (
        <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} action="waitlist" resetKey={state} />
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm font-medium text-danger">
          {state.status === "error" ? state.message : null}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Anotándote…" : "Anotarme en la lista"}
        </button>
      </div>
    </form>
  );
}

function FieldHint({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-muted">
      {children}
    </p>
  );
}

function FieldError({
  field,
  errors,
}: {
  field: WaitlistField;
  errors: Partial<Record<WaitlistField, string>>;
}) {
  if (!errors[field]) return null;
  return (
    <p id={`${field}-error`} className="mt-1.5 text-sm font-medium text-danger">
      {errors[field]}
    </p>
  );
}
