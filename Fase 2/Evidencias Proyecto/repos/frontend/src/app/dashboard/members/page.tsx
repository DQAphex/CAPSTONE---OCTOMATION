import type { Metadata } from "next";
import { Pencil, Trash2, UserPlus } from "lucide-react";

import { getInitials } from "@/lib/format";
import { members } from "@/lib/mock-data";
import { roleLabels, roleStyles } from "@/lib/roles";
import type { MemberStatus } from "@/types";

export const metadata: Metadata = {
  title: "Miembros del Equipo · OCTOMATION",
};

const statusLabels: Record<MemberStatus, string> = {
  ACTIVE: "Activo",
  PENDING: "Pendiente",
};

const statusStyles: Record<MemberStatus, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const statusDotStyles: Record<MemberStatus, string> = {
  ACTIVE: "bg-emerald-400",
  PENDING: "bg-amber-400",
};

export default function MembersPage() {
  const pendingCount = members.filter(
    (member) => member.status === "PENDING",
  ).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Miembros del Equipo
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Invita personas a tu workspace y administra su rol y acceso.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500"
        >
          <UserPlus className="size-4" />
          Invitar Miembro
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-octo-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h3 className="text-sm font-medium text-zinc-100">
            {members.length} miembros
          </h3>
          <p className="text-xs text-zinc-500">
            {pendingCount}{" "}
            {pendingCount === 1
              ? "invitación pendiente"
              : "invitaciones pendientes"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-zinc-500">
                <th scope="col" className="px-6 py-3 font-medium">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-octo-800/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                        {getInitials(member.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleStyles[member.role]}`}
                    >
                      {roleLabels[member.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[member.status]}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${statusDotStyles[member.status]}`}
                      />
                      {statusLabels[member.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Editar a ${member.name}`}
                        className="flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-octo-800 hover:text-violet-300"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar a ${member.name}`}
                        className="flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
