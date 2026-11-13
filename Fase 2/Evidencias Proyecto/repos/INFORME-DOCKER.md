# Informe de implementacion - Docker Compose OCTOMATION

Fecha: 2026-11-05

## 1. Objetivo

Implementar un stack centralizado de Docker Compose que levante PostgreSQL, IAM,
Tenants, Billing, Plugins, Transacciones y el frontend Next.js con un solo comando,
respetando la arquitectura de submodulos y las configuraciones reales de cada
servicio.

Criterios principales:

- Un contenedor por microservicio.
- Red bridge propia `octomation-network`.
- PostgreSQL con healthcheck real (`pg_isready`).
- Migraciones completadas antes de iniciar las APIs dependientes.
- Sin cambios innecesarios en migraciones, lockfiles o arquitectura.
- Variables de entorno centralizadas y secretos fuera de Git.
- Validacion real de construccion, arranque, conexiones y persistencia.

## 2. Analisis del repositorio

Se revisaron los submodulos y sus archivos de configuracion antes de escribir el
stack. Hallazgos relevantes:

| Componente | Tecnologia | Puerto real | Persistencia | Observaciones |
| --- | --- | --- | --- | --- |
| `billing` | NestJS + Prisma | 4001 | PostgreSQL | Su `.env` local apunta a `transactions_db` por error |
| `iam-service` | NestJS + Drizzle | 4002 | PostgreSQL | No tiene carpeta de migraciones versionadas |
| `OCTO_TRANSACTIONS` | Express + Webpay | 4003 | JSON en `/app/data` | No usa PostgreSQL en el codigo |
| `tenants` | NestJS + Drizzle | 4004 | PostgreSQL | El journal omite la migracion `0005` |
| `plugins` | NestJS + Drizzle | 4005 | PostgreSQL | La migracion SQL versionada esta vacia/incompleta |
| `octomation-frontend` | Next.js 16.4.1 | 3000 | No aplica | Usa `NEXT_PUBLIC_*` desde el navegador |
| `plataforma-backend` | Sin aplicacion ejecutable | - | - | No se incluye como servicio |
| `Octomation-Engine-Client` | Cliente Electron | - | - | Fuera del alcance del stack web |
| `Octomation-Engine-Server` / `plugin_generator` | Python | - | - | Fuera del alcance del stack web |

Tambien se detecto:

- Billing usa npm con `package-lock.json` versionado.
- IAM usa npm con `package-lock.json` versionado.
- El frontend usa npm con `package-lock.json` versionado.
- Tenants y Plugins usan pnpm 11.22.0 con `pnpm-lock.yaml` y `pnpm-workspace.yaml`.
- Transacciones usa npm, pero su lockfile esta desactualizado.
- Tenants emite `dist/src/main.js`, no `dist/main.js`, porque su
  `tsconfig.build.json` incluye `drizzle.config.ts`.

## 3. Decisiones de implementacion

### Contexto de build en la raiz

El `docker-compose.yml` vive en `Fase 2/Evidencias Proyecto/repos` y usa la raiz como
contexto. Los Dockerfiles se guardaron en `docker/<servicio>/Dockerfile`. Asi no se
agregan archivos de infraestructura dentro de los submodulos.

### Una base logica por microservicio

Se mantiene una sola instancia PostgreSQL 15 con cinco bases:

- `iam_db`
- `tenant_db`
- `billing_db`
- `transactions_db`
- `plugins_db`

El script `docker/postgres/init-databases.sql` las crea en el primer arranque del
volumen. El healthcheck no solo comprueba `pg_isready`: tambien ejecuta `SELECT 1`
contra cada base para evitar que las APIs arranquen antes de que existan.

### Migraciones como jobs independientes

Se crearon cuatro jobs de un solo uso:

- `billing-migrate`: `prisma migrate deploy`.
- `iam-migrate`: `drizzle-kit push --force`.
- `tenants-migrate`: `drizzle-kit push --force`.
- `plugins-migrate`: `drizzle-kit push --force`.

El uso de `push` en IAM, Tenants y Plugins se justifica porque:

- IAM no tiene migraciones Drizzle versionadas.
- El journal de Tenants no registra `0005_invitation_email.sql`.
- La migracion SQL de Plugins esta vacia y no coincide con el esquema actual.

No se editaron migraciones ni se inventaron archivos de journal.

### Dependencias entre servicios

Cada API depende de PostgreSQL y de su job de migracion. Tenants depende ademas de
IAM. El frontend depende de todas las APIs. Las condiciones usadas son
`service_healthy` y `service_completed_successfully`, no solo `depends_on` basico.

### Red y nombres DNS

Todos los servicios estan en `octomation-network`. La comunicacion interna usa:

- `postgres:5432`
- `iam:4002`
- `billing:4001`
- `tenants:4004`
- `plugins:4005`
- `transactions:4003`

El frontend no usa esos nombres para las APIs porque las peticiones salen del
navegador. Por eso `NEXT_PUBLIC_*` apunta a `http://localhost:<puerto-host>`.

### Volumenes

- `octomation-postgres-data`: datos de PostgreSQL.
- `octomation-transactions-data`: pedidos de Transacciones en
  `/app/data/pedidos.json`.

## 4. Archivos creados

```text
docker-compose.yml
.env.example
.dockerignore
.gitignore
docker/postgres/init-databases.sql
docker/billing/Dockerfile
docker/iam/Dockerfile
docker/tenants/Dockerfile
docker/plugins/Dockerfile
docker/transactions/Dockerfile
docker/frontend/Dockerfile
README-DOCKER.md
INFORME-DOCKER.md
```

El archivo `.env` se creo localmente para la validacion, pero esta ignorado por Git.

## 5. Cambios necesarios en submodulos

Aunque el objetivo era no modificar los submodulos, el build de produccion encontro
tres problemas reales que impedian completar la validacion. Se aplicaron cambios
minimos y justificados.

### `octomation-frontend`

1. `src/app/dashboard/workspaces/page.tsx`
   - Se movio la comprobacion `result.aborted` dentro del bloque `!result.ok` para
     que TypeScript estreche correctamente el tipo de la union.
   - Sin esto, el build fallaba en la verificacion de tipos.

2. `src/app/dashboard/layout.tsx`
   - Se envolvieron `Sidebar` y `Navbar` en `Suspense`.
   - Ambos usan `usePathname()`, y Next.js 16 con `cacheComponents` exige un limite
     de `Suspense` para datos de URL en componentes cliente.

3. `src/app/dashboard/workspaces/[id]/plugins/page.tsx`
   - Se separo el contenido que usa `useParams()` en un componente interno y se
     envolvio en `Suspense`.
   - Sin esto, el prerender de la ruta dinamica fallaba con
     `CLIENT_HOOK_DYNAMIC`.

### `plugins`

- `dotenv` estaba en `devDependencies`, pero `src/main.ts` lo importa en runtime.
- `pnpm prune --prod` lo eliminaba de la imagen y el contenedor fallaba con
  `ERR_MODULE_NOT_FOUND: Cannot find package 'dotenv'`.
- Se movio `dotenv` a `dependencies` en `package.json` y se actualizo el importer
  correspondiente en `pnpm-lock.yaml`.

### Construccion Docker del frontend

- La etapa `deps` usa `NODE_ENV=development` para instalar devDependencies.
- Esa variable se heredaba a `next build`, lo que provocaba el error conocido
  `Cannot read properties of null (reading 'useContext')` al prerenderizar
  `/_global-error`.
- Se agrego `ENV NODE_ENV=production` en la etapa `build`.
- Tambien se fijo `NODE_ENV=production` en las etapas de build de Billing, IAM,
  Tenants y Plugins para evitar configuraciones inconsistentes.

## 6. Validaciones ejecutadas

### 6.1 Sintaxis de Compose

```powershell
docker compose config --quiet
```

Resultado: exit code `0`, sin errores de sintaxis ni variables obligatorias faltantes.

### 6.2 Construccion completa

```powershell
docker compose up --build -d
```

Resultado: exit code `0`. Se construyeron 10 imagenes propias y se descargo la imagen
oficial de PostgreSQL:

- `octomation/billing:latest`
- `octomation/billing:migrate`
- `octomation/iam:latest`
- `octomation/iam:migrate`
- `octomation/tenants:latest`
- `octomation/tenants:migrate`
- `octomation/plugins:latest`
- `octomation/plugins:migrate`
- `octomation/transactions:latest`
- `octomation/frontend:latest`
- `postgres:15-alpine` (pull oficial)

### 6.3 Estado de contenedores

```powershell
docker compose ps
```

Resultado: los siete contenedores de ejecucion quedaron `running (healthy)`:

```text
octomation-billing-1        healthy   4001
octomation-frontend-1       healthy   3000
octomation-iam-1            healthy   4002
octomation-plugins-1        healthy   4005
octomation-postgres-1       healthy   5433
octomation-tenants-1        healthy   4004
octomation-transactions-1   healthy   4003
```

Los cuatro jobs de migracion terminaron con `Exited (0)`.

### 6.4 Creacion de esquemas

Se consultaron las tablas reales con `psql` dentro del contenedor:

```text
iam_db:      8 tablas
tenant_db:   7 tablas
billing_db:  3 tablas (incluye _prisma_migrations)
plugins_db:  2 tablas
transactions_db: sin tablas (la app usa JSON)
```

Billing registro sus dos migraciones como aplicadas:

```text
20260907225247_init
20260915223008_enforce_tenant_uuid
```

### 6.5 Endpoints HTTP

Se validaron respuestas `200` en:

```text
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/dashboard/workspaces
http://localhost:4001/
http://localhost:4001/plans
http://localhost:4002/
http://localhost:4002/iam/users
http://localhost:4002/api/docs
http://localhost:4003/
http://localhost:4004/
http://localhost:4004/tenants
http://localhost:4004/docs
http://localhost:4005/
http://localhost:4005/plugins
http://localhost:4005/docs
```

Los listados devolvieron arreglos vacios porque no se cargaron datos de prueba.

### 6.6 Comunicacion por DNS interno

```text
tenants -> http://iam:4002/           => 200 "Hello World!"
frontend -> http://billing:4001/      => 200
frontend -> http://iam:4002/          => 200
frontend -> http://tenants:4004/      => 200
frontend -> http://plugins:4005/      => 200
frontend -> http://transactions:4003/ => 200
```

Esto confirma que la red `octomation-network` resuelve correctamente los nombres de
servicio y que no se esta usando `localhost` para comunicacion entre contenedores.

### 6.7 Persistencia de PostgreSQL

Se creo una tabla temporal `docker_persistence_check` en `transactions_db` con un
registro, se reinicio el contenedor `postgres` y se volvio a consultar:

```text
id | note
1  | sobrevive al reinicio
```

Luego se elimino la tabla de prueba.

### 6.8 Persistencia de Transacciones

Se escribio `/app/data/persistence-check.txt` dentro del contenedor, se reinicio
`transactions` y se leyo nuevamente el contenido:

```text
persistencia-ok
```

Luego se elimino el archivo de prueba.

### 6.9 Puertos

Antes del arranque se verifico que los puertos `3000`, `4001`, `4002`, `4003`,
`4004`, `4005` y `5433` estaban libres en el host. Despues del arranque, Docker los
publico en las interfaces IPv4 e IPv6 del host sin conflictos.

### 6.10 Reinicio de PostgreSQL con servicios activos

Despues de reiniciar PostgreSQL, los servicios siguieron respondiendo:

```text
http://localhost:4001/plans     => 200
http://localhost:4002/iam/users => 200
http://localhost:4004/tenants   => 200
http://localhost:4005/plugins   => 200
http://localhost:4003/          => 200
http://localhost:3000/          => 200
```

Billing registro un error transitorio de Prisma por el corte de conexion
(`terminating connection due to administrator command`), pero se recupero y las
consultas posteriores funcionaron.

## 7. Incidencias encontradas y solucion

| Incidencia | Causa | Solucion |
| --- | --- | --- |
| Frontend fallaba en `/_global-error` | `NODE_ENV=development` heredado en `next build` | `ENV NODE_ENV=production` en la etapa de build |
| Frontend fallaba en ruta dinamica de plugins | `useParams`/`usePathname` fuera de `Suspense` con `cacheComponents` | Limites de `Suspense` en layout y pagina |
| Build de TypeScript fallaba en workspaces | `result.aborted` no estrechaba el tipo | Mover la comprobacion dentro de `!result.ok` |
| Plugins fallaba con `dotenv` no encontrado | `dotenv` era devDependency y se eliminaba con `pnpm prune --prod` | Moverlo a `dependencies` |
| PostgreSQL no estaba listo para APIs | Healthcheck solo de puerto | `pg_isready` + `SELECT 1` en las cinco bases |
| Migraciones de IAM/Tenants/Plugins incompletas | Sin migraciones, journal incompleto o SQL vacio | Jobs con `drizzle-kit push --force` |
| Billing apuntaba a la base equivocada | `.env` local con `transactions_db` | `DATABASE_URL` explicita a `billing_db` |
| Tenants no arrancaba | Salida real en `dist/src/main.js` | CMD corregido |
| Transacciones no instalaba dependencias | Lockfile desactualizado | `npm install --omit=dev --no-package-lock` en la imagen |
| Transacciones no usaba PostgreSQL | La app persiste en JSON | Se documento y se monto volumen para `/app/data` |

## 8. Limitaciones y recomendaciones

1. El stack no carga datos iniciales. Los endpoints de listado devuelven arreglos
   vacios hasta que se creen registros mediante las APIs.
2. `transactions_db` existe por compatibilidad, pero no tiene tablas porque la
   aplicacion actual usa un archivo JSON.
3. Las credenciales de Transbank y SMTP estan vacias en `.env`; la aplicacion
   responde, pero no procesa pagos reales ni envia correos.
4. Para produccion se recomienda:
   - Usar secretos gestionados fuera del repositorio.
   - No publicar PostgreSQL al host si no es necesario.
   - Agregar backups de los volumenes.
   - Reemplazar `drizzle-kit push` por migraciones versionadas cuando los
     repositorios de IAM, Tenants y Plugins las tengan completas.
5. El `.env` local usado para la validacion contiene credenciales de desarrollo. No
   debe reutilizarse en produccion.
6. Los cambios en los submodulos estan sin commit. Antes de integrarlos hay que
   revisarlos y confirmarlos en sus repositorios correspondientes.

## 9. Estado final

- Stack completo construido y ejecutandose.
- Todos los healthchecks en verde.
- Migraciones aplicadas y esquemas verificados.
- APIs, Swagger, frontend y Transacciones respondiendo.
- DNS interno y persistencia validados.
- Documentacion de operacion en `README-DOCKER.md`.
- No se realizaron commits ni push.
