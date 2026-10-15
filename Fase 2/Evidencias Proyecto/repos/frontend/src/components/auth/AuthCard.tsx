import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import OctomationLogo from "@/components/brand/OctomationLogo";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: AuthCardProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-octo-950 px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-160 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl"
      />

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Volver al inicio
      </Link>

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <OctomationLogo className="size-10" />
          <span className="text-2xl font-medium tracking-tight text-zinc-100">
            Octomation
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-octo-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-zinc-400">{footer}</p>
        </div>
      </div>
    </div>
  );
}
