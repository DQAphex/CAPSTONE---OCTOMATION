import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { navItems } from "@/components/layout/nav-items";
import {
  currentUser,
  membersCount,
  subscription,
  workspaces,
} from "@/lib/mock-data";
import type { SubscriptionStatus } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard · OCTOMATION",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: "Activa",
  PAST_DUE: "Pago pendiente",
  CANCELED: "Cancelada",
};

const statusStyles: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-500",
  PAST_DUE: "bg-amber-500",
  CANCELED: "bg-red-500",
};

interface MetricCardProps {
  title: string;
  value: string;
  hint: ReactNode;
  icon: LucideIcon;
}

function MetricCard({ title, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-octo-800 dark:bg-octo-900/50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <Icon className="size-4 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {hint}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const usagePercent = Math.round(
    (subscription.usageAutomations / subscription.maxAutomations) * 100,
  );
  const renewal = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${subscription.renewalDate}T00:00:00Z`));
  const numberFormat = new Intl.NumberFormat("es-CL");
  const firstName = currentUser.name.split(" ")[0];
  const shortcuts = navItems.filter((item) => item.href !== "/dashboard");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Hola, {firstName} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Este es el resumen de tu organización en OCTOMATION.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Workspaces activos"
          value={String(workspaces.length)}
          hint="Espacios a los que perteneces"
          icon={Building2}
        />
        <MetricCard
          title="Miembros"
          value={String(membersCount)}
          hint="En el workspace actual"
          icon={Users}
        />
        <MetricCard
          title="Estado de Suscripción"
          value={`Plan ${subscription.planName}`}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${statusStyles[subscription.status]}`}
              />
              {statusLabels[subscription.status]} · renueva el {renewal}
            </span>
          }
          icon={CreditCard}
        />
        <MetricCard
          title="Automatizaciones ejecutadas"
          value={numberFormat.format(subscription.usageAutomations)}
          hint={
            <div className="space-y-1.5">
              <span>
                {usagePercent}% de{" "}
                {numberFormat.format(subscription.maxAutomations)} este ciclo
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-octo-800">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>
          }
          icon={Zap}
        />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Accesos directos
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {shortcuts.map(({ href, label, description, tag, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-octo-800 dark:bg-octo-900/50 dark:hover:border-octo-700 dark:hover:bg-octo-900"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-octo-800 dark:bg-octo-900">
                <Icon className="size-5 text-zinc-700 dark:text-zinc-300" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {label}
                  </span>
                  {tag && (
                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                      {tag}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                  {description}
                </span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
