import type { Subscription, User, Workspace } from "@/types";

// Datos de ejemplo hasta integrar los servicios de IAM, Tenants y Billing.

export const currentUser: User = {
  id: "usr_01",
  name: "Santiago Pérez",
  email: "santiago@octomation.io",
  role: "TENANT_ADMIN",
};

export const workspaces: Workspace[] = [
  {
    id: "ws_01",
    name: "Acme Corp",
    slug: "acme-corp",
    planId: "plan_pro",
    role: "TENANT_ADMIN",
  },
  {
    id: "ws_02",
    name: "Globex Labs",
    slug: "globex-labs",
    planId: "plan_starter",
    role: "MEMBER",
  },
  {
    id: "ws_03",
    name: "Initech",
    slug: "initech",
    planId: "plan_enterprise",
    role: "MEMBER",
  },
];

export const subscription: Subscription = {
  id: "sub_01",
  planName: "Pro",
  status: "ACTIVE",
  price: 49,
  renewalDate: "2026-11-15",
  usageAutomations: 1284,
  maxAutomations: 5000,
};

export const membersCount = 12;
