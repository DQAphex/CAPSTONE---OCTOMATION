import Link from "next/link";
import { ArrowRight, Diamond } from "lucide-react";

import OctomationLogo from "@/components/brand/OctomationLogo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-octo-950">
      <header className="bg-octo-900">
        <div className="flex h-24 w-full items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <OctomationLogo />
            <span className="text-3xl font-medium tracking-tight text-zinc-100">
              Octomation
            </span>
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-octo-700 px-4 text-sm font-medium text-zinc-100 transition-colors hover:border-violet-500 hover:bg-octo-800"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 items-center py-16 lg:min-h-195 lg:py-0">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:gap-24">
          <section>
            <h1 className="max-w-lg text-4xl font-normal leading-tight tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
              Creamos tecnología que impulsa negocios reales.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
              OCTOMATION es la plataforma SaaS multi-tenant que centraliza tus
              workspaces, equipos, permisos y suscripciones, para que tu
              organización automatice sus flujos de trabajo de punta a punta y
              se enfoque en lo que realmente importa: hacer crecer el negocio.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 text-sm font-medium text-white transition-colors hover:bg-violet-500"
              >
                Ir al Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          <section
            aria-hidden="true"
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm">
              <p className="mb-2 flex items-center gap-1.5 text-sm text-violet-500">
                <Diamond className="size-3.5 fill-current" />
                Windowhero
              </p>
              <div className="h-80 rounded-xl bg-octo-900 p-4 shadow-2xl shadow-black/30">
                <div className="flex gap-2">
                  <span className="size-3 rounded-full bg-green-500" />
                  <span className="size-3 rounded-full bg-yellow-400" />
                  <span className="size-3 rounded-full bg-red-500" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
