export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "MEMBER";

export type PlanName = "Starter" | "Pro" | "Enterprise";

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  planId: string;
  role: UserRole;
}

export type MemberStatus = "ACTIVE" | "PENDING";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
}

export interface Permission {
  label: string;
  granted: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  permissions: Permission[];
}

export interface Subscription {
  id: string;
  planName: PlanName;
  status: SubscriptionStatus;
  price: number;
  /** Fecha ISO 8601 (YYYY-MM-DD). */
  renewalDate: string;
  usageAutomations: number;
  maxAutomations: number;
}
