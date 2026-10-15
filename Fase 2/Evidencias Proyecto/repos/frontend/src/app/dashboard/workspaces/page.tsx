import type { Metadata } from "next";
import {
  Building2,
  ChevronRight,
  CreditCard,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { workspaces } from "@/lib/mock-data";
import { roleLabels, roleStyles } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mis Workspaces · OCTOMATION",
};

const planLabels: Record<string, string> = {
  plan_starter: "Starter",
  plan_pro: "Pro",
  plan_enterprise: "Enterprise",
};

export default function WorkspacesPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Mis Workspaces
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Espacios de trabajo a los que perteneces y tu rol en cada uno.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500"
        >
          <Plus className="size-4" />
          Crear nuevo Workspace
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => (
          <article
            key={workspace.id}
            className="group relative flex flex-col rounded-2xl border border-white/10 bg-octo-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-colors hover:border-violet-500/40"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30">
                <Building2 className="size-6" />
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleStyles[workspace.role]}`}
              >
                <ShieldCheck className="size-3" />
                {roleLabels[workspace.role]}
              </span>
            </div>

            <h3 className="mt-5 text-lg font-semibold text-zinc-100">
              {workspace.name}
            </h3>
            <p className="font-mono text-xs text-zinc-500">
              /{workspace.slug}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-zinc-400">
                <CreditCard className="size-4" />
                Plan {planLabels[workspace.planId] ?? workspace.planId}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-violet-400 transition-colors group-hover:text-violet-300">
                Abrir
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>
        ))}

        <button
          type="button"
          className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-octo-700 text-zinc-400 transition-colors hover:border-violet-500/50 hover:bg-octo-900/40 hover:text-violet-300"
        >
          <span className="flex size-12 items-center justify-center rounded-xl border border-octo-700">
            <Plus className="size-6" />
          </span>
          <span className="text-sm font-medium">Crear nuevo Workspace</span>
        </button>
      </section>
    </div>
  );
}
