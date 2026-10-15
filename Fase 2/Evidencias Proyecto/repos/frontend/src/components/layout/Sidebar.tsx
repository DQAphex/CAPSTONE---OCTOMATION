"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown, Menu, Workflow, X } from "lucide-react";

import { workspaces } from "@/lib/mock-data";
import type { Workspace } from "@/types";
import { isNavItemActive, navItems } from "./nav-items";

function WorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(
    workspaces[0],
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 dark:border-octo-800 dark:bg-octo-900 dark:hover:bg-octo-800/70"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          {activeWorkspace.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-zinc-900 dark:text-zinc-100">
            {activeWorkspace.name}
          </span>
          <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
            {activeWorkspace.slug}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar selector de workspace"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-octo-800 dark:bg-octo-900"
          >
            {workspaces.map((workspace) => {
              const selected = workspace.id === activeWorkspace.id;
              return (
                <li key={workspace.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspace(workspace);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-octo-800"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:bg-octo-700 dark:text-zinc-200">
                      {workspace.name.charAt(0)}
                    </span>
                    <span className="flex-1 truncate">{workspace.name}</span>
                    {selected && <Check className="size-4 text-zinc-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="fixed left-3 top-3 z-30 flex size-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 lg:hidden dark:text-zinc-300 dark:hover:bg-octo-800"
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-octo-800 dark:bg-octo-950 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Workflow className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
              OCTOMATION
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="flex size-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-200 lg:hidden dark:hover:bg-octo-800"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3 pb-4">
          <WorkspaceSwitcher />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Plataforma
          </p>
          {navItems.map(({ href, label, tag, icon: Icon }) => {
            const active = isNavItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:bg-octo-900 dark:text-zinc-100 dark:ring-octo-800"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-octo-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${
                    active
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  }`}
                />
                <span className="flex-1 truncate">{label}</span>
                {tag && (
                  <span className="rounded border border-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:border-octo-800 dark:text-zinc-500">
                    {tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4 text-xs text-zinc-400 dark:border-octo-800 dark:text-zinc-500">
          © OCTOMATION · v0.1.0
        </div>
      </aside>
    </>
  );
}
