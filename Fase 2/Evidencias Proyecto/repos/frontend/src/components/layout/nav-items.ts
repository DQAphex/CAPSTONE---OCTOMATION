import {
  Building2,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  tag?: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Resumen General",
    description: "Vista general de tu actividad.",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/workspaces",
    label: "Mis Workspaces",
    description: "Crea y administra tus espacios de trabajo.",
    tag: "HU-5",
    icon: Building2,
  },
  {
    href: "/dashboard/members",
    label: "Miembros e Invitaciones",
    description: "Invita usuarios y gestiona tu equipo.",
    tag: "HU-6",
    icon: Users,
  },
  {
    href: "/dashboard/roles",
    label: "Roles y Permisos IAM",
    description: "Define roles y controla accesos.",
    tag: "HU-11",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard/billing",
    label: "Suscripción y Facturación",
    description: "Revisa tu plan, consumo y facturas.",
    tag: "HU-1",
    icon: CreditCard,
  },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => isNavItemActive(pathname, item.href));
}
