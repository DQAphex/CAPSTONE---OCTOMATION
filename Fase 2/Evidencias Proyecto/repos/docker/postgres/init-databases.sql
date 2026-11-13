-- ============================================================================
-- Inicializacion de bases de datos de OCTOMATION
--
-- Este script lo ejecuta la imagen oficial de PostgreSQL SOLO cuando el
-- directorio de datos esta vacio (primer arranque del volumen).
-- Para volver a ejecutarlo hay que eliminar el volumen:
--   docker compose down -v
--
-- Nombres fijos e intencionales: coinciden con las conexiones reales de cada
-- microservicio y con plataforma-backend/init.sql.
-- ============================================================================

\set ON_ERROR_STOP on

SELECT 'CREATE DATABASE iam_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'iam_db')\gexec

SELECT 'CREATE DATABASE tenant_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tenant_db')\gexec

SELECT 'CREATE DATABASE billing_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'billing_db')\gexec

SELECT 'CREATE DATABASE transactions_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transactions_db')\gexec

SELECT 'CREATE DATABASE plugins_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'plugins_db')\gexec
