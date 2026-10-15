import type { Member, Role, Subscription, User, Workspace } from "@/types";

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

export const members: Member[] = [
  {
    id: "usr_01",
    name: "Santiago Pérez",
    email: "santiago@octomation.io",
    role: "TENANT_ADMIN",
    status: "ACTIVE",
  },
  {
    id: "usr_02",
    name: "Valentina Rojas",
    email: "valentina@acme.com",
    role: "MEMBER",
    status: "ACTIVE",
  },
  {
    id: "usr_03",
    name: "Matías González",
    email: "matias@acme.com",
    role: "MEMBER",
    status: "PENDING",
  },
];

export const membersCount = members.length;

const permissionLabels = {
  manageMembers: "Puede invitar y gestionar miembros",
  manageRoles: "Puede administrar roles y permisos",
  createAutomations: "Puede crear automatizaciones",
  runAutomations: "Puede ejecutar automatizaciones",
  viewBilling: "Puede ver facturación",
  manageBilling: "Puede cambiar el plan y medios de pago",
};

export const roles: Role[] = [
  {
    id: "role_tenant_admin",
    name: "TENANT_ADMIN",
    description:
      "Control total del workspace: equipo, permisos, automatizaciones y facturación.",
    membersCount: 1,
    permissions: [
      { label: permissionLabels.manageMembers, granted: true },
      { label: permissionLabels.manageRoles, granted: true },
      { label: permissionLabels.createAutomations, granted: true },
      { label: permissionLabels.runAutomations, granted: true },
      { label: permissionLabels.viewBilling, granted: true },
      { label: permissionLabels.manageBilling, granted: true },
    ],
  },
  {
    id: "role_member",
    name: "MEMBER",
    description:
      "Colabora en los flujos de trabajo del equipo sin acceso administrativo.",
    membersCount: 2,
    permissions: [
      { label: permissionLabels.manageMembers, granted: false },
      { label: permissionLabels.manageRoles, granted: false },
      { label: permissionLabels.createAutomations, granted: true },
      { label: permissionLabels.runAutomations, granted: true },
      { label: permissionLabels.viewBilling, granted: false },
      { label: permissionLabels.manageBilling, granted: false },
    ],
  },
  {
    id: "role_billing_manager",
    name: "BILLING_MANAGER",
    description:
      "Gestiona la suscripción, los pagos y revisa el consumo del workspace.",
    membersCount: 0,
    permissions: [
      { label: permissionLabels.manageMembers, granted: false },
      { label: permissionLabels.manageRoles, granted: false },
      { label: permissionLabels.createAutomations, granted: false },
      { label: permissionLabels.runAutomations, granted: false },
      { label: permissionLabels.viewBilling, granted: true },
      { label: permissionLabels.manageBilling, granted: true },
    ],
  },
];
