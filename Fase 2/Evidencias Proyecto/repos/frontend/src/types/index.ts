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
