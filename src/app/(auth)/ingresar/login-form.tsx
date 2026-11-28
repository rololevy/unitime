"use client";

import { useActionState, useState } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";

import { sendEmailCode, signInWithGoogle, verifyEmailCode, type LoginState } from "./actions";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const inputClass =
  "block w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base text-foreground shadow-xs placeholder:text-muted/70 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40 aria-invalid:border-danger";
const primaryButton =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-70";

export function LoginForm({ next, googleError }: { next: string; googleError: boolean }) {
  const [codeFor, setCodeFor] = useState<string | null>(null);

  return (
    <div className="mt-8 space-y-6">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 font-semibold transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
        {googleError ? (
          <p role="alert" className="mt-2 text-sm font-medium text-danger">
            No pudimos completar el ingreso con Google. Probá de nuevo.
          </p>
        ) : null}
      </form>

      <div className="flex items-center gap-3 text-sm text-muted" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />o con tu email<span className="h-px flex-1 bg-border" />
      </div>

      {codeFor ? (
        <CodeStep email={codeFor} next={next} onBack={() => setCodeFor(null)} />
      ) : (
        <EmailStep onCodeSent={setCodeFor} />
      )}
    </div>
  );
}

function EmailStep({ onCodeSent }: { onCodeSent: (email: string) => void }) {
  const [state, formAction, pending] = useActionState(async (previous: LoginState, formData: FormData) => {
    const result = await sendEmailCode(previous, formData);
    if (result.step === "code") onCodeSent(result.email);
    return result;
  }, { step: "email" } satisfies LoginState);

  const error = state.step === "email" ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div>
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
          defaultValue={state.step === "email" ? state.email : undefined}
          placeholder="vos@tu-universidad.edu.ar"
          className={inputClass}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "email-error" : undefined}
        />
        {error ? (
          <p id="email-error" className="mt-1.5 text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
      {TURNSTILE_SITE_KEY ? <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} action="login" resetKey={state} /> : null}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Enviando…" : "Mandame un código"}
      </button>
    </form>
  );
}

function CodeStep({ email, next, onBack }: { email: string; next: string; onBack: () => void }) {
  const [state, formAction, pending] = useActionState(verifyEmailCode, { step: "code", email } satisfies LoginState);
  const error = state.error;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />
      <p className="text-sm text-muted" role="status">
        Te mandamos un código de 6 números a <strong className="text-foreground">{email}</strong>. Si no lo ves,
        revisá la carpeta de spam.
      </p>
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
          Código
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "code-error" : undefined}
        />
        {error ? (
          <p id="code-error" className="mt-1.5 text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Verificando…" : "Ingresar"}
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm font-medium text-primary underline underline-offset-2">
        Usar otro email o pedir un código nuevo
      </button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.39-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}
