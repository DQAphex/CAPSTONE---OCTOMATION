import type { Metadata } from "next";
import {
  CalendarClock,
  CreditCard,
  Sparkles,
  CircleX,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { subscription } from "@/lib/mock-data";
import type { SubscriptionStatus } from "@/types";

export const metadata: Metadata = {
  title: "Suscripción y Facturación · OCTOMATION",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  ACTIVE: "Activo",
  PAST_DUE: "Pago pendiente",
  CANCELED: "Cancelado",
};

const statusStyles: Record<SubscriptionStatus, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  PAST_DUE: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  CANCELED: "border-red-500/30 bg-red-500/10 text-red-400",
};

const statusDotStyles: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-emerald-400",
  PAST_DUE: "bg-amber-400",
  CANCELED: "bg-red-400",
};

interface DetailProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function Detail({ icon: Icon, label, value }: DetailProps) {
  return (
    <div className="rounded-xl border border-octo-800 bg-octo-950/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export default function BillingPage() {
  const usagePercent = Math.min(
    Math.round(
      (subscription.usageAutomations / subscription.maxAutomations) * 100,
    ),
    100,
  );
  const renewal = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${subscription.renewalDate}T00:00:00Z`));
  const price = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
  }).format(subscription.price);
  const numberFormat = new Intl.NumberFormat("es-CL");

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Suscripción y Facturación
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Revisa tu plan actual, el consumo del ciclo y gestiona tu
          suscripción.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-octo-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30">
              <CreditCard className="size-6" />
            </span>
            <div>
              <p className="text-sm text-zinc-400">Plan actual</p>
              <h3 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Plan {subscription.planName}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusStyles[subscription.status]}`}
          >
            <span
              className={`size-2 rounded-full ${statusDotStyles[subscription.status]}`}
            />
            {statusLabels[subscription.status]}
          </span>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <Detail icon={Wallet} label="Precio mensual" value={`${price} / mes`} />
          <Detail
            icon={CalendarClock}
            label="Próxima renovación"
            value={renewal}
          />
          <Detail
            icon={Zap}
            label="Límite del plan"
            value={`${numberFormat.format(subscription.maxAutomations)} automatizaciones`}
          />
        </div>

        <div className="relative mt-8">
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-300">
              Has usado{" "}
              <span className="font-semibold text-zinc-100">
                {numberFormat.format(subscription.usageAutomations)}
              </span>{" "}
              de {numberFormat.format(subscription.maxAutomations)}{" "}
              automatizaciones este mes
            </p>
            <span className="font-mono text-xs text-zinc-400">
              {usagePercent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={usagePercent}
            aria-label="Uso de automatizaciones"
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-octo-950"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-600 to-fuchsia-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-octo-700 bg-octo-950/60 px-5 text-sm font-medium text-zinc-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <CircleX className="size-4" />
            Cancelar Suscripción
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500"
          >
            <Sparkles className="size-4" />
            Mejorar Plan
          </button>
        </div>
      </section>
    </div>
  );
}
