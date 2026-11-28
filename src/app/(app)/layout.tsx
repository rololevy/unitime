import Link from "next/link";

import { signOut } from "../(auth)/ingresar/actions";
import { Logo } from "../(public)/_components/logo";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/inicio" className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <Logo />
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm font-medium text-muted hover:text-foreground">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main id="contenido" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
