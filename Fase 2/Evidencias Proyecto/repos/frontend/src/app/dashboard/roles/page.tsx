import type { Metadata } from "next";
import {
  CircleCheck,
  CircleMinus,
  Plus,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { roles } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Roles y Permisos · OCTOMATION",
};

export default function RolesPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Roles y Permisos
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Define qué puede hacer cada rol dentro de tu workspace.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500"
        >
          <Plus className="size-4" />
          Crear nuevo Rol
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <article
            key={role.id}
            className="flex flex-col rounded-2xl border border-white/10 bg-octo-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-colors hover:border-violet-500/40"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30">
                <ShieldCheck className="size-6" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-octo-700 bg-octo-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                <Users className="size-3" />
                {role.membersCount}{" "}
                {role.membersCount === 1 ? "miembro" : "miembros"}
              </span>
            </div>

            <h3 className="mt-5 font-mono text-base font-semibold text-zinc-100">
              {role.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">{role.description}</p>

            <ul className="mt-6 flex-1 space-y-2.5 border-t border-white/10 pt-5">
              {role.permissions.map((permission) => (
                <li
                  key={permission.label}
                  className={`flex items-start gap-2.5 text-sm ${
                    permission.granted ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {permission.granted ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleMinus className="mt-0.5 size-4 shrink-0 text-zinc-600" />
                  )}
                  <span className={permission.granted ? "" : "line-through"}>
                    {permission.label}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-octo-700 bg-octo-950/60 text-sm font-medium text-zinc-300 transition-colors hover:border-violet-500/50 hover:bg-octo-800 hover:text-violet-300"
            >
              <Settings2 className="size-4" />
              Editar permisos
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
