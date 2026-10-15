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
    name: "Startup X",
    slug: "startup-x",
    planId: "plan_starter",
    role: "MEMBER",
  },
];

export const subscription: Subscription = {
  id: "sub_01",
  planName: "Pro",
  status: "ACTIVE",
  price: 49,
  renewalDate: "2026-11-15",
  usageAutomations: 450,
  maxAutomations: 1000,
};

export const membersCount = 12;
