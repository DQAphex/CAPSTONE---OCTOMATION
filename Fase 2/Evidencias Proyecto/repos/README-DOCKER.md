# OCTOMATION - Docker Compose

Stack centralizado para levantar la plataforma OCTOMATION completa desde la raiz del
repositorio:

- PostgreSQL 15 con una base de datos logica por microservicio.
- Job de migraciones por cada API que usa base de datos.
- APIs NestJS de Billing, IAM, Tenants y Plugins.
- Aplicacion Express/Webpay `OCTO_TRANSACTIONS`.
- Frontend Next.js.
- Red bridge propia `octomation-network`.
- Volumenes persistentes para PostgreSQL y para los pedidos de Transacciones.

## Arquitectura

```text
Navegador
  |-- http://localhost:3000  -> frontend
  |-- http://localhost:4001  -> billing
  |-- http://localhost:4002  -> iam
  |-- http://localhost:4003  -> transactions
  |-- http://localhost:4004  -> tenants
  `-- http://localhost:4005  -> plugins

octomation-network (bridge)
  frontend, billing, iam, tenants, plugins, transactions
        |
        `-- postgres:5432
```

El frontend usa URLs `http://localhost:<puerto-host>` porque las llamadas a las APIs se
ejecutan en el navegador del usuario. La comunicacion interna entre contenedores usa
nombres DNS de Docker, por ejemplo `http://iam:4002`.

## Requisitos

- Docker Desktop con Docker Engine 24 o superior.
- Docker Compose v2 (`docker compose`).
- Puertos libres en el host: `3000`, `4001`, `4002`, `4003`, `4004`, `4005` y `5433`.
  Todos son configurables desde `.env`.

Versiones con las que se valido este stack:

```text
Docker 28.3.0
Docker Compose v2.38.1-desktop.1
Node.js 22.23.4 dentro de las imagenes
```

## Inicio rapido

```powershell
# 1. Crear la configuracion local (no se versiona)
Copy-Item .env.example .env

# 2. Editar .env y cambiar como minimo:
#    POSTGRES_PASSWORD
#    JWT_SECRET

# 3. Construir y levantar todo
docker compose up --build -d

# 4. Ver el estado
docker compose ps
```

Todos los servicios deben quedar en `healthy`. Los jobs `*-migrate` deben quedar en
`Exited (0)`.

Para detener el stack sin borrar datos:

```powershell
docker compose down
```

Para detener y borrar tambien los volumenes (destructivo):

```powershell
docker compose down -v
```

## Servicios

| Servicio | Contenedor | Imagen | Puerto interno | Puerto host | Base de datos | Migracion |
| --- | --- | --- | --- | --- | --- | --- |
| postgres | octomation-postgres-1 | `postgres:15-alpine` | 5432 | 5433 | Todas | Script de init |
| billing-migrate | octomation-billing-migrate-1 | `octomation/billing:migrate` | - | - | `billing_db` | `prisma migrate deploy` |
| iam-migrate | octomation-iam-migrate-1 | `octomation/iam:migrate` | - | - | `iam_db` | `drizzle-kit push --force` |
| tenants-migrate | octomation-tenants-migrate-1 | `octomation/tenants:migrate` | - | - | `tenant_db` | `drizzle-kit push --force` |
| plugins-migrate | octomation-plugins-migrate-1 | `octomation/plugins:migrate` | - | - | `plugins_db` | `drizzle-kit push --force` |
| billing | octomation-billing-1 | `octomation/billing:latest` | 4001 | 4001 | `billing_db` | Espera `billing-migrate` |
| iam | octomation-iam-1 | `octomation/iam:latest` | 4002 | 4002 | `iam_db` | Espera `iam-migrate` |
| transactions | octomation-transactions-1 | `octomation/transactions:latest` | 4003 | 4003 | No usa PostgreSQL | No aplica |
| tenants | octomation-tenants-1 | `octomation/tenants:latest` | 4004 | 4004 | `tenant_db` | Espera `tenants-migrate` e `iam` |
| plugins | octomation-plugins-1 | `octomation/plugins:latest` | 4005 | 4005 | `plugins_db` | Espera `plugins-migrate` |
| frontend | octomation-frontend-1 | `octomation/frontend:latest` | 3000 | 3000 | No usa PostgreSQL | Espera todas las APIs |

Los puertos del host se cambian en `.env`:

```dotenv
POSTGRES_PORT=5433
BILLING_PORT=4001
IAM_PORT=4002
TRANSACTIONS_PORT=4003
TENANTS_PORT=4004
PLUGINS_PORT=4005
FRONTEND_PORT=3000
```

Si se cambia un puerto del host, tambien hay que ajustar la URL publica correspondiente
del frontend (`NEXT_PUBLIC_*`) y `TRANSACTIONS_BASE_URL`.

## URLs

| Aplicacion | URL principal | Documentacion |
| --- | --- | --- |
| Frontend | http://localhost:3000 | - |
| Billing | http://localhost:4001 | http://localhost:4001/docs |
| IAM | http://localhost:4002 | http://localhost:4002/api/docs |
| Transacciones | http://localhost:4003 | - |
| Tenants | http://localhost:4004 | http://localhost:4004/docs |
| Plugins | http://localhost:4005 | http://localhost:4005/docs |
| PostgreSQL | `localhost:5433` | - |

Credenciales de PostgreSQL: las definidas en `.env` (`POSTGRES_USER` y
`POSTGRES_PASSWORD`).

## Bases de datos

El script `docker/postgres/init-databases.sql` crea, solo en el primer arranque del
volumen:

- `iam_db`
- `tenant_db`
- `billing_db`
- `transactions_db`
- `plugins_db`

`transactions_db` se crea por consistencia con la configuracion historica de la
plataforma, pero `OCTO_TRANSACTIONS` persiste sus pedidos en
`/app/data/pedidos.json`, no en PostgreSQL.

Tablas verificadas despues de las migraciones:

| Base de datos | Tablas |
| --- | --- |
| `iam_db` | `permissions`, `roles`, `roles_to_permissions`, `users`, `users_to_permissions`, `users_to_roles`, `users_to_workgroups`, `workgroups` |
| `tenant_db` | `members`, `members_data`, `tenant_workspaces`, `tenants`, `workspace_details`, `workspace_invitation`, `workspace_members` |
| `billing_db` | `_prisma_migrations`, `plans`, `subscriptions` |
| `plugins_db` | `plugins`, `workspace_plugins` |
| `transactions_db` | Sin tablas; la aplicacion usa un archivo JSON |

## Volumenes y persistencia

| Volumen | Uso |
| --- | --- |
| `octomation-postgres-data` | Datos de PostgreSQL |
| `octomation-transactions-data` | Archivo `/app/data/pedidos.json` de Transacciones |

Los volumenes sobreviven a `docker compose down`, reinicios de contenedores y
recreaciones de imagenes. Solo se eliminan con `docker compose down -v`.

## Orden de arranque

1. `postgres` inicia y ejecuta el script de creacion de bases.
2. El healthcheck de PostgreSQL comprueba `pg_isready` contra `127.0.0.1` y que las
   cinco bases respondan `SELECT 1`.
3. Los cuatro jobs de migracion esperan a que PostgreSQL este `healthy` y terminan.
4. Cada API espera a su job de migracion con
   `condition: service_completed_successfully`.
5. `tenants` espera ademas a que `iam` este `healthy`.
6. `frontend` espera a que Billing, IAM, Tenants, Plugins y Transacciones esten
   `healthy`.

## Comandos utiles

```powershell
# Estado de servicios y healthchecks
docker compose ps

# Logs en vivo
docker compose logs -f

# Logs de un servicio
docker compose logs -f billing
docker compose logs -f frontend

# Reconstruir un solo servicio
docker compose build billing
docker compose up -d --no-deps --force-recreate billing

# Abrir psql dentro del contenedor
docker compose exec postgres psql -U octomation -d billing_db

# Reiniciar sin perder datos
docker compose restart

# Eliminar contenedores, red y volumenes (destructivo)
docker compose down -v
```

## Validacion ejecutada

Fecha de validacion: 2026-11-05.

### 1. Sintaxis

```powershell
docker compose config --quiet
# exit code: 0
```

### 2. Construccion

```powershell
docker compose up --build -d
# exit code: 0
```

Imagenes involucradas (10 construidas + 1 oficial descargada):

```text
octomation/billing:latest
octomation/billing:migrate
octomation/iam:latest
octomation/iam:migrate
octomation/tenants:latest
octomation/tenants:migrate
octomation/plugins:latest
octomation/plugins:migrate
octomation/transactions:latest
octomation/frontend:latest
postgres:15-alpine (pull oficial)
```

### 3. Estado final

```text
octomation-billing-1        running (healthy)   0.0.0.0:4001->4001/tcp
octomation-frontend-1       running (healthy)   0.0.0.0:3000->3000/tcp
octomation-iam-1            running (healthy)   0.0.0.0:4002->4002/tcp
octomation-plugins-1        running (healthy)   0.0.0.0:4005->4005/tcp
octomation-postgres-1       running (healthy)   0.0.0.0:5433->5432/tcp
octomation-tenants-1        running (healthy)   0.0.0.0:4004->4004/tcp
octomation-transactions-1   running (healthy)   0.0.0.0:4003->4003/tcp
```

Los jobs `billing-migrate`, `iam-migrate`, `tenants-migrate` y `plugins-migrate`
terminaron con `Exited (0)`.

### 4. Endpoints HTTP

```text
http://localhost:3000/                                  => 200
http://localhost:3000/login                             => 200
http://localhost:3000/dashboard                         => 200
http://localhost:3000/dashboard/workspaces              => 200
http://localhost:4001/                                  => 200
http://localhost:4001/plans                             => 200 []
http://localhost:4002/                                  => 200
http://localhost:4002/iam/users                         => 200 []
http://localhost:4002/api/docs                          => 200
http://localhost:4003/                                  => 200
http://localhost:4004/                                  => 200
http://localhost:4004/tenants                           => 200 {"data":[],...}
http://localhost:4004/docs                              => 200
http://localhost:4005/                                  => 200
http://localhost:4005/plugins                           => 200 []
http://localhost:4005/docs                              => 200
```

Los endpoints de listado devuelven arreglos vacios porque la base se crea desde cero.
No se cargaron datos de prueba.

### 5. DNS interno

```text
tenants -> http://iam:4002/       => 200 "Hello World!"
frontend -> http://billing:4001/  => 200
frontend -> http://iam:4002/      => 200
frontend -> http://tenants:4004/  => 200
frontend -> http://plugins:4005/  => 200
frontend -> http://transactions:4003/ => 200
```

### 6. Persistencia

Se creo una tabla temporal `docker_persistence_check` en `transactions_db`, se
reinicio PostgreSQL y el registro siguio disponible. Luego se elimino la tabla.

Tambien se escribio `/app/data/persistence-check.txt` dentro del contenedor de
Transacciones, se reinicio el contenedor y el archivo siguio disponible. Luego se
elimino el archivo.

### 7. Puertos

Antes de levantar el stack se verifico que `3000`, `4001`, `4002`, `4003`, `4004`,
`4005` y `5433` estaban libres en el host.

## Decisiones y notas

- El contexto de build es la raiz `repos/` y los Dockerfiles viven en `docker/`, para
  no agregar archivos de infraestructura dentro de cada submodulo.
- Billing usa `billing_db` de forma explicita. Su `.env` local apunta por error a
  `transactions_db`, pero el contenedor no copia ese archivo.
- IAM no tiene carpeta de migraciones Drizzle, por eso se usa `drizzle-kit push`.
- Tenants tiene un journal de Drizzle que omite `0005_invitation_email.sql`; se usa
  `drizzle-kit push` para alinear el esquema real sin editar migraciones.
- Plugins tiene una migracion SQL versionada vacia/incompleta; se usa
  `drizzle-kit push` para crear el esquema real.
- Tenants compila a `dist/src/main.js` por como su `tsconfig.build.json` incluye
  `drizzle.config.ts`.
- `OCTO_TRANSACTIONS` no usa PostgreSQL en su codigo actual. Se conecta a la red y
  espera a PostgreSQL para respetar el orden comun de inicializacion.
- El lockfile de `OCTO_TRANSACTIONS` esta desactualizado; su imagen instala desde
  `package.json` sin reescribir el lockfile versionado.
- En Plugins, `dotenv` se importa en `src/main.ts` pero estaba declarado como
  `devDependency`. Se movio a `dependencies` para que exista en la imagen de
  produccion.
- El frontend usa `NEXT_PUBLIC_*` con `localhost` porque las peticiones salen del
  navegador. No deben cambiarse por nombres de servicio de Docker.
- La pagina dinamica de plugins y los componentes que usan `usePathname`/`useParams`
  se envolvieron en `Suspense` para cumplir con `cacheComponents` de Next.js 16.

## Problemas conocidos y soluciones

### Un puerto esta ocupado

Cambiar el puerto del host en `.env` y, si corresponde, la URL publica del frontend:

```dotenv
BILLING_PORT=4101
NEXT_PUBLIC_BILLING_URL=http://localhost:4101
```

Luego:

```powershell
docker compose up -d
```

### Una API no arranca

```powershell
docker compose ps
docker compose logs --tail 200 <servicio>
```

Si el problema es una migracion, revisar el job correspondiente:

```powershell
docker compose logs billing-migrate
docker compose logs iam-migrate
docker compose logs tenants-migrate
docker compose logs plugins-migrate
```

### Se necesita reiniciar la base desde cero

```powershell
docker compose down -v
docker compose up --build -d
```

Esto elimina todos los datos.

### Cambio de variables `NEXT_PUBLIC_*`

Estas variables se incrustan en el bundle durante el build. Despues de cambiarlas hay
que reconstruir el frontend:

```powershell
docker compose build --no-cache frontend
docker compose up -d --no-deps --force-recreate frontend
```

## Seguridad

- `.env` esta en `.gitignore` y en `.dockerignore`.
- `.env.example` solo contiene valores de ejemplo.
- Cambiar `POSTGRES_PASSWORD` y `JWT_SECRET` antes de usar el stack fuera de un
  entorno local.
- Las credenciales de Transbank y SMTP son opcionales y se leen desde `.env`.
- No se copiaron archivos `.env` de los submodulos dentro de las imagenes.
