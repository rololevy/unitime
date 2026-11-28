import type { Metadata } from "next";
import { Suspense } from "react";

import { safeNextPath } from "@/lib/validation/auth";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false },
};

export default function LoginPage(props: PageProps<"/ingresar">) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Ingresar</h1>
      <p className="mt-2 text-sm text-muted">
        Con Google o con un código que te mandamos por email. No usamos contraseñas.
      </p>
      <Suspense fallback={<div className="mt-8 h-40" aria-hidden="true" />}>
        <LoginContent searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/ingresar">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const googleError = params.error === "google";
  return <LoginForm next={next} googleError={googleError} />;
}
