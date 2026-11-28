"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Verificación anti-bots de Cloudflare Turnstile. Agrega al formulario el
 * campo oculto `cf-turnstile-response`, que el servidor valida.
 * Cambiar `resetKey` pide un token nuevo (los tokens son de un solo uso).
 */
export function TurnstileWidget({
  siteKey,
  action,
  resetKey,
}: {
  siteKey: string;
  action: string;
  resetKey: unknown;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!scriptReady || !element || !window.turnstile) return;
    const id = window.turnstile.render(element, {
      sitekey: siteKey,
      action,
      theme: "auto",
      // En pantallas angostas el widget normal (300 px) no entra.
      size: element.offsetWidth < 300 ? "compact" : "flexible",
    });
    widgetId.current = id;
    return () => {
      window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [scriptReady, siteKey, action]);

  useEffect(() => {
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
