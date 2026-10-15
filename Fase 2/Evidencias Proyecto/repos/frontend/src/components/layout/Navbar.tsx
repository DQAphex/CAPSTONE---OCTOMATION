"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import { getInitials } from "@/lib/format";
import { currentUser } from "@/lib/mock-data";
import type { UserRole } from "@/types";
import { getActiveNavItem } from "./nav-items";

const roleStyles: Record<UserRole, string> = {
  SUPER_ADMIN:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
  TENANT_ADMIN:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  MEMBER:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-octo-700 dark:bg-octo-800 dark:text-zinc-300",
};

export default function Navbar() {
  const pathname = usePathname();
  const section = getActiveNavItem(pathname)?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 pl-16 pr-4 backdrop-blur-md sm:pr-6 lg:pl-8 dark:border-octo-800 dark:bg-octo-950/80">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="hidden text-zinc-400 sm:inline dark:text-zinc-500">
          Dashboard
        </span>
        <span className="hidden text-zinc-300 sm:inline dark:text-zinc-700">
          /
        </span>
        <h1 className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {section}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span
          className={`hidden rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium sm:inline-flex ${roleStyles[currentUser.role]}`}
        >
          {currentUser.role}
        </span>

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-octo-800 dark:hover:text-zinc-100"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-octo-950" />
        </button>

        <Link
          href="/login"
          title={`${currentUser.name} · ${currentUser.email}`}
          className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-white ring-2 ring-white transition-opacity hover:opacity-90 dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900 dark:ring-octo-950"
        >
          {getInitials(currentUser.name)}
        </Link>
      </div>
    </header>
  );
}
