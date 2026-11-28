import Link from "next/link";

import { Logo } from "../(public)/_components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="contenido" className="flex flex-1 flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-8 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">{children}</div>
    </main>
  );
}
