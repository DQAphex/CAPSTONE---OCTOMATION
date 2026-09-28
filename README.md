# 🐙 OCTOMATION - Documentación Ágil

Bienvenido al repositorio central de OCTOMATION. Este proyecto utiliza arquitectura de microservicios (NestJS, PostgreSQL, Prisma) integrados con un frontend moderno (Next.js), gestionados bajo la metodología ágil Scrum.

## 👥 Mapa de Actores
El sistema está diseñado para atender a tres niveles de usuarios principales:

* **Administrador de Plataforma (Superadmin):** Gestiona la salud general de los microservicios, crea y actualiza los planes de suscripción globales, y audita las métricas generales del sistema.
* **Administrador de Workspace (Tenant):** El cliente corporativo que contrata el servicio. Es responsable de gestionar la facturación de su empresa, administrar su propio espacio de trabajo aislado y otorgar permisos de acceso a sus empleados.
* **Usuario Final (Empleado):** Pertenece a un Workspace específico. Inicia sesión a través del sistema IAM y utiliza las herramientas de la plataforma según el nivel de privilegios asignado por su Tenant.

---

## 🛡️ Squad y Responsabilidades (Scrum Team)
El desarrollo de esta plataforma está a cargo del siguiente equipo multidisciplinario:

* **Diego Quioza (Product Owner & Developer)**
  * *Responsabilidades:* Definición de requerimientos, priorización del Backlog en Jira y desarrollo del microservicio core de Gestión de Workspaces.
* **Santiago Santander (Scrum Master & Backend Developer)**
  * *Responsabilidades:* Gestión de ceremonias ágiles, administración del tablero Scrum, y desarrollo del microservicio de Facturación/Suscripciones (Billing) utilizando PostgreSQL y Prisma.
* **Denis / Anyelo (Developer)**
  * *Responsabilidades:* Desarrollo e integración del microservicio de Identidad y Accesos (IAM), gestión de autenticación, JWT y registro de usuarios.
