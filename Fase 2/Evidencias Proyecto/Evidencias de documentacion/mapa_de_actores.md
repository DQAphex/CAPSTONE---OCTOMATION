## 👥 Mapa de Actores
El sistema está diseñado para atender a tres niveles de usuarios principales:

* **Administrador de Plataforma (Superadmin):** Gestiona la salud general de los microservicios, crea y actualiza los planes de suscripción globales, y audita las métricas generales del sistema.
* **Administrador de Workspace (Tenant):** El cliente corporativo que contrata el servicio. Es responsable de gestionar la facturación de su empresa, administrar su propio espacio de trabajo aislado y otorgar permisos de acceso a sus empleados.
* **Usuario Final (Empleado):** Pertenece a un Workspace específico. Inicia sesión a través del sistema IAM y utiliza las herramientas de la plataforma según el nivel de privilegios asignado por su Tenant.

---