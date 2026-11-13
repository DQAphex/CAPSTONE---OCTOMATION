# Schemas de los microservicios NestJS

Documento consolidado con los esquemas de base de datos de cada microservicio NestJS del repositorio.

| Microservicio | ORM | Ubicación del schema | Tablas / modelos |
|---|---|---|---|
| `billing` | Prisma | `billing/prisma/schema.prisma` | `plans`, `subscriptions` |
| `iam-service` | Drizzle | `iam-service/src/database/schema.ts` | `users`, `roles`, `permissions`, `users_to_roles`, `roles_to_permissions`, `users_to_permissions`, `workgroups`, `users_to_workgroups` |
| `plugins` | Drizzle | `plugins/src/database/schema/` | `plugins`, `workspace_plugins` |
| `tenants` | Drizzle | `tenants/src/database/schema/` | `tenants`, `tenant_workspaces`, `workspace_details`, `members`, `members_data`, `workspace_members`, `workspace_invitation` |

> Nota: `OCTO_TRANSACTIONS` no es un microservicio NestJS (usa Express) y no conserva su carpeta `src`; solo tiene el schema compilado en `dist`. Se incluye como anexo al final, reconstruido desde `dist/database/schema/transactions.schema.js`.

---

## 1. `billing` — Prisma

**Archivo:** `billing/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE

  @@map("subscription_status")
}

model Plan {
  id            String   @id @default(uuid()) @db.Uuid
  name          String
  price         Decimal  @db.Decimal(10, 2)
  maxStorage    Int      @map("max_storage")
  maxExecutions Int      @map("max_executions")
  createdAt     DateTime @default(now()) @map("created_at")

  subscriptions Subscription[]

  @@map("plans")
}

model Subscription {
  id                 String             @id @default(uuid()) @db.Uuid
  tenantId           String             @map("tenant_id") @db.Uuid
  status             SubscriptionStatus
  planId             String             @map("plan_id") @db.Uuid
  plan               Plan               @relation(fields: [planId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  currentPeriodStart DateTime           @map("current_period_start")
  currentPeriodEnd   DateTime           @map("current_period_end")
  createdAt          DateTime           @default(now()) @map("created_at")

  @@index([planId])
  @@index([tenantId])
  @@map("subscriptions")
}
```

---

## 2. `iam-service` — Drizzle

**Archivo:** `iam-service/src/database/schema.ts`

```ts
// src/database/schema.ts
import { pgTable, uuid, text, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. USUARIOS
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  isActive: boolean('is_active').default(true).notNull(), // Control de habilitación/deshabilitación
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. ROLES
export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // ej: 'ADMIN', 'OPERATOR', 'VIEWER'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. PERMISOS
export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // ej: 'WORKSPACE_CREATE', 'PLUGIN_ADD'
  slug: text('slug'), // Compatible con implementaciones previas ej: 'workspace:create'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(), // Habilitar / Deshabilitar permisos
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. TABLA PIVOTE: USUARIOS A ROLES (N:M)
export const usersToRoles = pgTable('users_to_roles', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// 5. TABLA PIVOTE: ROLES A PERMISOS (N:M)
export const rolesToPermissions = pgTable('roles_to_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

// 6. TABLA PIVOTE: USUARIOS A PERMISOS DIRECTOS (N:M)
export const usersToPermissions = pgTable('users_to_permissions', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.permissionId] }),
}));

// 7. GRUPOS DE TRABAJO (WORKGROUPS)
export const workgroups = pgTable('workgroups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. TABLA PIVOTE: USUARIOS A GRUPOS DE TRABAJO (N:M)
export const usersToWorkgroups = pgTable('users_to_workgroups', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workgroupId: uuid('workgroup_id').notNull().references(() => workgroups.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.workgroupId] }),
}));

// ========================================================
// RELACIONES DRIZZLE (Consultas con 'with')
// ========================================================

export const usersRelations = relations(users, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  usersToPermissions: many(usersToPermissions),
  usersToWorkgroups: many(usersToWorkgroups),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  usersToRoles: many(usersToRoles),
  rolesToPermissions: many(rolesToPermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolesToPermissions: many(rolesToPermissions),
  usersToPermissions: many(usersToPermissions),
}));

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
  user: one(users, { fields: [usersToRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [usersToRoles.roleId], references: [roles.id] }),
}));

export const rolesToPermissionsRelations = relations(rolesToPermissions, ({ one }) => ({
  role: one(roles, { fields: [rolesToPermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolesToPermissions.permissionId], references: [permissions.id] }),
}));

export const usersToPermissionsRelations = relations(usersToPermissions, ({ one }) => ({
  user: one(users, { fields: [usersToPermissions.userId], references: [users.id] }),
  permission: one(permissions, { fields: [usersToPermissions.permissionId], references: [permissions.id] }),
}));

export const workgroupsRelations = relations(workgroups, ({ many }) => ({
  usersToWorkgroups: many(usersToWorkgroups),
}));

export const usersToWorkgroupsRelations = relations(usersToWorkgroups, ({ one }) => ({
  user: one(users, { fields: [usersToWorkgroups.userId], references: [users.id] }),
  workgroup: one(workgroups, { fields: [usersToWorkgroups.workgroupId], references: [workgroups.id] }),
}));
```

---

## 3. `plugins` — Drizzle

**Carpeta:** `plugins/src/database/schema/`

### 3.1 `plugins.schema.ts`

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const plugins = pgTable(
  "plugins",
  {
    pluginId: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // Metadatos del crawler
    name: varchar("name", { length: 100 })
      .notNull(),

    pluginCategory: varchar("plugin_category", {
      length: 100
    })
      .notNull(),

    author: varchar("author", { length: 100 })
      .notNull(),

    email: varchar("email", { length: 254 })
      .notNull(),

    // Repositorio y versión publicada
    repositoryUrl: text("repository_url")
      .notNull(),

    latestVersion: varchar("latest_version", {
      length: 20
    })
      .notNull(),

    releaseTag: varchar("release_tag", {
      length: 50
    })
      .notNull(),

    // Fecha original de creación del plugin
    pluginCreatedAt: timestamp("plugin_created_at", {
      withTimezone: true
    })
      .notNull(),

    // Auditoría del registro en PostgreSQL
    createdAt: timestamp("created_at", {
      withTimezone: true
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true
    })
      .defaultNow()
      .notNull()
  },
  (table) => [
    uniqueIndex("plugins_repository_url_uidx")
      .on(table.repositoryUrl)
  ]
);

export type Plugin = typeof plugins.$inferSelect;
export type NewPlugin = typeof plugins.$inferInsert;
```

### 3.2 `workspace_plugins.schema.ts`

```ts
import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core';

import { plugins } from './plugins.schema.js';
import { statusEnum } from './enums.js';
export const workspacePlugins = pgTable(
  'workspace_plugins',
  {
    workspacePluginId: uuid('workspace_plugin_id')
      .defaultRandom()
      .primaryKey(),

    workspaceId: uuid('workspace_id')
      .notNull(),

    pluginId: uuid('plugin_id')
      .notNull()
      .references(() => plugins.pluginId, {
        onDelete: 'cascade'
      }),

    installedAt: timestamp('installed_at')
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      
  },
  (table) => [
    uniqueIndex('workspace_plugins_unique_idx')
      .on(table.workspaceId, table.pluginId)
  ]
);

export type WorkspacePlugin =
  typeof workspacePlugins.$inferSelect;

export type NewWorkspacePlugin =
  typeof workspacePlugins.$inferInsert;
```

### 3.3 `enums.ts`

```ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'PERSONA_NATURAL',
  'EMPRESA',
]);

export type TenantType = (typeof tenantTypeEnum.enumValues)[number];

export const statusEnum = pgEnum('status', [
  'ACTIVE',
  'INACTIVE',
]);
export type Status = (typeof statusEnum.enumValues)[number];

export const invitationStatusEnum = pgEnum('invitation_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);
```

### 3.4 `index.ts`

```ts
export * from './plugins.schema.js';
export * from './workspace_plugins.schema.js';
```

---

## 4. `tenants` — Drizzle

**Carpeta:** `tenants/src/database/schema/`

### 4.1 `tenants.schema.ts`

```ts
import {
  pgTable,
  uuid,
  varchar,
  integer,
  char,
  timestamp,
} from 'drizzle-orm/pg-core';

import { tenantTypeEnum, statusEnum } from './enums';

export const tenants = pgTable('tenants', {
  tenantId: uuid('tenant_id')
    .defaultRandom()
    .primaryKey(),

  name: varchar('name', {
    length: 45,
  }).notNull(),

  rut: integer('rut')
    .notNull(),

  dv: char('dv', {
    length: 1,
  }).notNull(),

  type: tenantTypeEnum('type')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});
```

### 4.2 `tenant-workspaces.schema.ts`

```ts
import {
  pgTable,
  uuid,
  integer,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';
import { statusEnum } from './enums';
import { tenants } from './tenants.schema';

export const tenantWorkspaces = pgTable('tenant_workspaces', {
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.tenantId),

  workspaceId: uuid('workspace_id')
    .defaultRandom()
    .primaryKey(),
  
  workspaceNombre: varchar('workspace_nombre', { length: 100 })
    .notNull(),

  maxMemberLimitId: uuid('max_member_limit_id')
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull()
});
```

### 4.3 `workspace-details.schema.ts`

```ts
import {
  pgTable,
  uuid,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

import { statusEnum } from './enums';

export const workspaceDetails = pgTable('workspace_details', {
  workspaceDetailsId: uuid('workspace_details_id')
    .defaultRandom()
    .primaryKey(),

  workspaceId: uuid('workspace_id')
    .notNull(),
  
  maxMemberLimitId: integer('max_member_limit_id'),

  capacity: integer('capacity')
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});
```

### 4.4 `member.schema.ts`

```ts
import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';
import { statusEnum } from './enums';

export const members = pgTable('members', {
  memberId: uuid('member_id')
    .defaultRandom()
    .primaryKey(),

  iamUserId: uuid('iam_user_id')
    .notNull(),

  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.tenantId),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});
```

### 4.5 `members-data.schema.ts`

```ts
import { 
  pgTable,
  uuid,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';

export const membersData = pgTable('members_data', {
  userId: uuid("user_id").primaryKey().defaultRandom(),

  memberId: uuid('member_id')
    .notNull()
    .references(() => members.memberId),

  name: varchar('name', {
    length: 45,
  }).notNull(),

  lastname: varchar('lastname', {
    length: 45,
  }).notNull(),

  profilePicture: varchar('profile_picture', {
    length: 45,
  }),
});
```

### 4.6 `workspace-members.schema.ts`

```ts
import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';
import { statusEnum } from './enums';

export const workspaceMembers = pgTable('workspace_members', {
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.memberId),

  workspaceId: uuid('workspace_id')
    .notNull(),

  createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

  status: statusEnum('status')
    .default('ACTIVE')
    .notNull(),
});
```

### 4.7 `workspace-invitations.schema.ts`

```ts
import {
  pgTable,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';

import { members } from './member.schema';
import {tenantWorkspaces} from './tenant-workspaces.schema';
import { statusEnum, invitationStatusEnum } from './enums';

export const workspaceInvitations = pgTable('workspace_invitation', {
  invitationId: uuid('invitation_id')
    .defaultRandom()
    .primaryKey(),

  receiverId: uuid('receiver_id')
    .notNull()
    .references(() => members.memberId),
  
  senderId: uuid('sender_id')
    .notNull()
    .references(() => members.memberId),

  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => tenantWorkspaces.workspaceId),

  createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

  expirationDate: timestamp('expiration_date')
      .notNull(),

  status: invitationStatusEnum('status')
    .default('PENDING')
    .notNull(),

  statusUpdatedAt: timestamp('status_updated_at')
    .defaultNow()
    .notNull(),
});
```

### 4.8 `enums.ts`

```ts
import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantTypeEnum = pgEnum('tenant_type', [
  'PERSONA_NATURAL',
  'EMPRESA',
]);

export type TenantType = (typeof tenantTypeEnum.enumValues)[number];

export const statusEnum = pgEnum('status', [
  'ACTIVE',
  'INACTIVE',
]);
export type Status = (typeof statusEnum.enumValues)[number];

export const invitationStatusEnum = pgEnum('invitation_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);
```

---

## Anexo: `OCTO_TRANSACTIONS` (no NestJS — solo `dist`)

**Archivo fuente original:** inexistente (`src` no está en el repositorio).
**Archivo compilado:** `OCTO_TRANSACTIONS/dist/database/schema/transactions.schema.js`
**Reconstrucción del schema (TypeScript equivalente):**

```ts
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  bigint,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const transactionStatus = pgEnum("transaction_status", [
  "PENDING",
  "AUTHORIZED",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
]);

export const paymentProvider = pgEnum("payment_provider", ["TRANSBANK"]);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    externalReference: varchar("external_reference", {
      length: 100,
    }).notNull(),
    idempotencyKey: varchar("idempotency_key", {
      length: 100,
    }).notNull(),
    amount: bigint("amount", {
      mode: "bigint",
    }).notNull(),
    currency: varchar("currency", {
      length: 3,
    }).notNull().default("CLP"),
    status: transactionStatus("status")
      .notNull()
      .default("PENDING"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("transactions_tenant_reference_uq")
      .on(table.tenantId, table.externalReference),
    uniqueIndex("transactions_tenant_idempotency_uq")
      .on(table.tenantId, table.idempotencyKey),
    index("transactions_status_idx")
      .on(table.status),
  ]
);

export const paymentAttempts = pgTable(
  "payment_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    provider: paymentProvider("provider")
      .notNull(),
    providerOrderId: varchar("provider_order_id", {
      length: 100,
    }).notNull(),
    providerTransactionId: varchar("provider_transaction_id", {
      length: 100,
    }),
    status: varchar("status", {
      length: 30,
    }).notNull().default("CREATED"),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("payment_attempts_transaction_idx")
      .on(table.transactionId),
    uniqueIndex("payment_attempts_provider_order_uq")
      .on(table.provider, table.providerOrderId),
  ]
);
```
