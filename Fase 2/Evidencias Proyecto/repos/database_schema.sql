-- ============================================================================
-- Esquema consolidado de base de datos PostgreSQL
-- Proyecto: Octomation
--
-- Generado a partir de:
--   - billing/prisma/schema.prisma                  (Prisma)
--   - iam-service/src/database/schema.ts            (Drizzle)
--   - plugins/src/database/schema/*.ts              (Drizzle)
--   - tenants/src/database/schema/*.ts              (Drizzle)
--   - OCTO_TRANSACTIONS/dist/database/schema/*.js   (Drizzle compilado, anexo)
--
-- Este script consolida todos los microservicios en UNA sola base de datos
-- PostgreSQL. Para producción se recomienda separar por bases de datos o,
-- como mínimo, por schemas independientes.
--
-- Ejecutar sobre una base de datos vacía:
--   psql -U <usuario> -d <base_de_datos> -f database_schema.sql
-- ============================================================================

BEGIN;

-- Necesario para gen_random_uuid() en PostgreSQL < 13.
-- En PostgreSQL >= 13 la función es nativa, pero la extensión no molesta.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TIPOS ENUM
-- ============================================================================

CREATE TYPE tenant_type AS ENUM (
  'PERSONA_NATURAL',
  'EMPRESA'
);

CREATE TYPE status AS ENUM (
  'ACTIVE',
  'INACTIVE'
);

CREATE TYPE invitation_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED'
);

CREATE TYPE subscription_status AS ENUM (
  'ACTIVE',
  'CANCELED',
  'PAST_DUE'
);

-- Enums de OCTO_TRANSACTIONS
CREATE TYPE transaction_status AS ENUM (
  'PENDING',
  'AUTHORIZED',
  'FAILED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED'
);

CREATE TYPE payment_provider AS ENUM (
  'TRANSBANK'
);

-- ============================================================================
-- MICROSERVICIO: iam-service
-- ============================================================================

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  slug        TEXT,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE users_to_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE roles_to_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users_to_permissions (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE workgroups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE users_to_workgroups (
  user_id      UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workgroup_id UUID      NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
  joined_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, workgroup_id)
);

-- Índices para el lado inverso de las relaciones N:M
CREATE INDEX users_to_roles_role_id_idx ON users_to_roles (role_id);
CREATE INDEX roles_to_permissions_permission_id_idx ON roles_to_permissions (permission_id);
CREATE INDEX users_to_permissions_permission_id_idx ON users_to_permissions (permission_id);
CREATE INDEX users_to_workgroups_workgroup_id_idx ON users_to_workgroups (workgroup_id);

-- ============================================================================
-- MICROSERVICIO: tenants
-- ============================================================================

CREATE TABLE tenants (
  tenant_id  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(45)  NOT NULL,
  rut        INTEGER      NOT NULL,
  dv         CHAR(1)      NOT NULL,
  type       tenant_type  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  status     status       NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE tenant_workspaces (
  tenant_id           UUID         NOT NULL REFERENCES tenants(tenant_id),
  workspace_id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_nombre    VARCHAR(100) NOT NULL,
  max_member_limit_id UUID         NOT NULL,
  updated_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
  status              status       NOT NULL DEFAULT 'ACTIVE',
  created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE workspace_details (
  workspace_details_id UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         UUID      NOT NULL,
  max_member_limit_id  INTEGER,
  capacity             INTEGER   NOT NULL,
  updated_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  status               status    NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE members (
  member_id   UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  iam_user_id UUID      NOT NULL,
  tenant_id   UUID      NOT NULL REFERENCES tenants(tenant_id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  status      status    NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE members_data (
  user_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID        NOT NULL REFERENCES members(member_id),
  name            VARCHAR(45) NOT NULL,
  lastname        VARCHAR(45) NOT NULL,
  profile_picture VARCHAR(45)
);

CREATE TABLE workspace_members (
  member_id    UUID      NOT NULL REFERENCES members(member_id),
  workspace_id UUID      NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  status       status    NOT NULL DEFAULT 'ACTIVE'

  -- El schema original no define PRIMARY KEY ni UNIQUE para esta tabla.
  -- Se recomienda agregar:
  -- PRIMARY KEY (workspace_id, member_id)
);

CREATE TABLE workspace_invitation (
  invitation_id     UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  receiver_id       UUID              NOT NULL REFERENCES members(member_id),
  sender_id         UUID              NOT NULL REFERENCES members(member_id),
  workspace_id      UUID              NOT NULL REFERENCES tenant_workspaces(workspace_id),
  created_at        TIMESTAMP         NOT NULL DEFAULT NOW(),
  expiration_date   TIMESTAMP         NOT NULL,
  status            invitation_status NOT NULL DEFAULT 'PENDING',
  status_updated_at TIMESTAMP         NOT NULL DEFAULT NOW()
);

CREATE INDEX tenant_workspaces_tenant_id_idx ON tenant_workspaces (tenant_id);
CREATE INDEX workspace_details_workspace_id_idx ON workspace_details (workspace_id);
CREATE INDEX members_tenant_id_idx ON members (tenant_id);
CREATE INDEX members_data_member_id_idx ON members_data (member_id);
CREATE INDEX workspace_members_workspace_id_idx ON workspace_members (workspace_id);
CREATE INDEX workspace_members_member_id_idx ON workspace_members (member_id);
CREATE INDEX workspace_invitation_receiver_id_idx ON workspace_invitation (receiver_id);
CREATE INDEX workspace_invitation_sender_id_idx ON workspace_invitation (sender_id);
CREATE INDEX workspace_invitation_workspace_id_idx ON workspace_invitation (workspace_id);

-- NOTA: tenant_workspaces.max_member_limit_id y workspace_details.max_member_limit_id
--       no tienen FK en el schema original. Tampoco members.iam_user_id, que apunta
--       lógicamente a iam-service.users.id.

-- ============================================================================
-- MICROSERVICIO: plugins
-- ============================================================================

CREATE TABLE plugins (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(100) NOT NULL,
  plugin_category   VARCHAR(100) NOT NULL,
  author            VARCHAR(100) NOT NULL,
  email             VARCHAR(254) NOT NULL,
  repository_url    TEXT         NOT NULL,
  latest_version    VARCHAR(20)  NOT NULL,
  release_tag       VARCHAR(50)  NOT NULL,
  plugin_created_at TIMESTAMPTZ  NOT NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX plugins_repository_url_uidx
  ON plugins (repository_url);

CREATE TABLE workspace_plugins (
  workspace_plugin_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID        NOT NULL,
  plugin_id           UUID        NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  installed_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX workspace_plugins_unique_idx
  ON workspace_plugins (workspace_id, plugin_id);

CREATE INDEX workspace_plugins_plugin_id_idx
  ON workspace_plugins (plugin_id);

-- NOTA: workspace_plugins.workspace_id apunta lógicamente a
--       tenants.tenant_workspaces.workspace_id, sin FK en el schema original.

-- ============================================================================
-- MICROSERVICIO: billing
-- ============================================================================

CREATE TABLE plans (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT           NOT NULL,
  price          NUMERIC(10, 2) NOT NULL,
  max_storage    INTEGER        NOT NULL,
  max_executions INTEGER        NOT NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id                   UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID                NOT NULL,
  status               subscription_status NOT NULL,
  plan_id              UUID                NOT NULL,
  current_period_start TIMESTAMP           NOT NULL,
  current_period_end   TIMESTAMP           NOT NULL,
  created_at           TIMESTAMP           NOT NULL DEFAULT NOW(),

  CONSTRAINT subscriptions_plan_id_fkey
    FOREIGN KEY (plan_id)
    REFERENCES plans(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE INDEX subscriptions_plan_id_idx ON subscriptions (plan_id);
CREATE INDEX subscriptions_tenant_id_idx ON subscriptions (tenant_id);

-- NOTA: subscriptions.tenant_id apunta lógicamente a tenants.tenants.tenant_id,
--       sin FK en el schema Prisma original.

-- ============================================================================
-- ANEXO: OCTO_TRANSACTIONS (no es NestJS; schema recuperado desde dist)
-- ============================================================================

CREATE TABLE transactions (
  id                 UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID               NOT NULL,
  external_reference VARCHAR(100)       NOT NULL,
  idempotency_key    VARCHAR(100)       NOT NULL,
  amount             BIGINT             NOT NULL,
  currency           VARCHAR(3)         NOT NULL DEFAULT 'CLP',
  status             transaction_status NOT NULL DEFAULT 'PENDING',
  created_at         TIMESTAMP          NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP          NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX transactions_tenant_reference_uq
  ON transactions (tenant_id, external_reference);

CREATE UNIQUE INDEX transactions_tenant_idempotency_uq
  ON transactions (tenant_id, idempotency_key);

CREATE INDEX transactions_status_idx
  ON transactions (status);

CREATE TABLE payment_attempts (
  id                      UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id          UUID             NOT NULL REFERENCES transactions(id),
  provider                payment_provider NOT NULL,
  provider_order_id       VARCHAR(100)     NOT NULL,
  provider_transaction_id VARCHAR(100),
  status                  VARCHAR(30)      NOT NULL DEFAULT 'CREATED',
  created_at              TIMESTAMP        NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE INDEX payment_attempts_transaction_idx
  ON payment_attempts (transaction_id);

CREATE UNIQUE INDEX payment_attempts_provider_order_uq
  ON payment_attempts (provider, provider_order_id);

-- NOTA: transactions.tenant_id y payment_attempts no referencian otras tablas
--       del conjunto; se mantienen sin FK tal como en el schema original.

COMMIT;

-- ============================================================================
-- SCRIPT OPCIONAL DE LIMPIEZA (descomentar solo si se desea recrear todo)
-- ¡Elimina todos los datos!
-- ============================================================================
-- BEGIN;
-- DROP TABLE IF EXISTS payment_attempts CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS plans CASCADE;
-- DROP TABLE IF EXISTS workspace_plugins CASCADE;
-- DROP TABLE IF EXISTS plugins CASCADE;
-- DROP TABLE IF EXISTS workspace_invitation CASCADE;
-- DROP TABLE IF EXISTS workspace_members CASCADE;
-- DROP TABLE IF EXISTS members_data CASCADE;
-- DROP TABLE IF EXISTS members CASCADE;
-- DROP TABLE IF EXISTS workspace_details CASCADE;
-- DROP TABLE IF EXISTS tenant_workspaces CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;
-- DROP TABLE IF EXISTS users_to_workgroups CASCADE;
-- DROP TABLE IF EXISTS workgroups CASCADE;
-- DROP TABLE IF EXISTS users_to_permissions CASCADE;
-- DROP TABLE IF EXISTS roles_to_permissions CASCADE;
-- DROP TABLE IF EXISTS users_to_roles CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS payment_provider CASCADE;
-- DROP TYPE IF EXISTS transaction_status CASCADE;
-- DROP TYPE IF EXISTS subscription_status CASCADE;
-- DROP TYPE IF EXISTS invitation_status CASCADE;
-- DROP TYPE IF EXISTS status CASCADE;
-- DROP TYPE IF EXISTS tenant_type CASCADE;
-- COMMIT;
