import type { UserRole } from "@/types";

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_ADMIN: "Admin",
  MEMBER: "Member",
};

export const roleStyles: Record<UserRole, string> = {
  SUPER_ADMIN: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  TENANT_ADMIN: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  MEMBER: "border-octo-700 bg-octo-800 text-zinc-300",
};
