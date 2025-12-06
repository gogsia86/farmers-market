-- ╔════════════════════════════════════════════════════════════════════╗
-- ║ 🌾 FARMERS MARKET PLATFORM - DATABASE INITIALIZATION              ║
-- ║ Divine Agricultural E-Commerce System                              ║
-- ║ PostgreSQL initialization script for production deployment        ║
-- ╚════════════════════════════════════════════════════════════════════╝

-- This script runs when the PostgreSQL container starts for the first time
-- It sets up the database structure, extensions, and initial configurations

\set ON_ERROR_STOP on

-- ============================================================================
-- SECTION 1: DATABASE CONFIGURATION
-- ============================================================================

-- Set client encoding
SET client_encoding = 'UTF8';

-- Set timezone to UTC
ALTER DATABASE :"POSTGRES_DB" SET timezone TO 'UTC';

-- Set search path
ALTER DATABASE :"POSTGRES_DB" SET search_path TO public, pg_catalog;

-- ============================================================================
-- SECTION 2: CREATE ADDITIONAL ROLES (IF NEEDED)
-- ============================================================================

-- Create read-only role for monitoring and reporting
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'farmers_readonly') THEN
        CREATE ROLE farmers_readonly WITH LOGIN PASSWORD 'readonly_change_in_prod';
        RAISE NOTICE 'Created role: farmers_readonly';
    ELSE
        RAISE NOTICE 'Role already exists: farmers_readonly';
    END IF;
END
$$;

-- Create backup role
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'farmers_backup') THEN
        CREATE ROLE farmers_backup WITH LOGIN PASSWORD 'backup_change_in_prod' NOSUPERUSER NOCREATEDB NOCREATEROLE;
        RAISE NOTICE 'Created role: farmers_backup';
    ELSE
        RAISE NOTICE 'Role already exists: farmers_backup';
    END IF;
END
$$;

-- ============================================================================
-- SECTION 3: CREATE EXTENSIONS
-- ============================================================================

-- UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
COMMENT ON EXTENSION "uuid-ossp" IS 'Generate universally unique identifiers (UUIDs)';

-- Full-text search support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
COMMENT ON EXTENSION "pg_trgm" IS 'Text similarity measurement and index searching based on trigrams';

-- Geospatial data support for farm locations
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE;
COMMENT ON EXTENSION "postgis" IS 'PostGIS geometry and geography spatial types and functions';

-- Case-insensitive text extension
CREATE EXTENSION IF NOT EXISTS "citext";
COMMENT ON EXTENSION "citext" IS 'Data type for case-insensitive character strings';

-- Additional useful extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions';

CREATE EXTENSION IF NOT EXISTS "btree_gin";
COMMENT ON EXTENSION "btree_gin" IS 'Support for indexing common datatypes in GIN';

CREATE EXTENSION IF NOT EXISTS "btree_gist";
COMMENT ON EXTENSION "btree_gist" IS 'Support for indexing common datatypes in GiST';

-- ============================================================================
-- SECTION 4: CREATE ADDITIONAL DATABASES (IF NEEDED)
-- ============================================================================

-- Create test database
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'farmers_market_test') THEN
        PERFORM dblink_exec('dbname=' || current_database(), 'CREATE DATABASE farmers_market_test');
        RAISE NOTICE 'Created database: farmers_market_test';
    ELSE
        RAISE NOTICE 'Database already exists: farmers_market_test';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create test database (this is expected if dblink is not available)';
END
$$;

-- ============================================================================
-- SECTION 5: GRANT PERMISSIONS
-- ============================================================================

-- Grant connect permission to readonly role
GRANT CONNECT ON DATABASE :"POSTGRES_DB" TO farmers_readonly;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO farmers_readonly;

-- Grant select on all tables (will be applied after Prisma migrations create tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO farmers_readonly;

-- Grant permissions for backup role
GRANT CONNECT ON DATABASE :"POSTGRES_DB" TO farmers_backup;
GRANT USAGE ON SCHEMA public TO farmers_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO farmers_backup;

-- ============================================================================
-- SECTION 6: CREATE CUSTOM TYPES AND FUNCTIONS
-- ============================================================================

-- Create custom enum types (if not created by Prisma)
DO $$
BEGIN
    -- These will be created by Prisma migrations, but we can prepare the schema
    RAISE NOTICE 'Custom types will be created by Prisma migrations';
END
$$;

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at column on row modification';

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(
        regexp_replace(
            regexp_replace(text, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_slug(text) IS 'Generate URL-friendly slug from text';

-- Function to calculate distance between two points (haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    R CONSTANT DOUBLE PRECISION := 6371; -- Earth's radius in kilometers
    dLat DOUBLE PRECISION;
    dLon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);

    a := sin(dLat/2) * sin(dLat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dLon/2) * sin(dLon/2);

    c := 2 * atan2(sqrt(a), sqrt(1-a));

    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance(double precision, double precision, double precision, double precision)
IS 'Calculate distance between two geographic points in kilometers using Haversine formula';

-- ============================================================================
-- SECTION 7: PERFORMANCE OPTIMIZATION SETTINGS
-- ============================================================================

-- Set statement timeout (30 seconds for most queries)
ALTER DATABASE :"POSTGRES_DB" SET statement_timeout = '30s';

-- Set lock timeout
ALTER DATABASE :"POSTGRES_DB" SET lock_timeout = '10s';

-- Set idle transaction timeout (5 minutes)
ALTER DATABASE :"POSTGRES_DB" SET idle_in_transaction_session_timeout = '5min';

-- Optimize for agricultural data queries
ALTER DATABASE :"POSTGRES_DB" SET random_page_cost = 1.1;
ALTER DATABASE :"POSTGRES_DB" SET effective_cache_size = '1GB';

-- ============================================================================
-- SECTION 8: CREATE SCHEMAS FOR ORGANIZATION (OPTIONAL)
-- ============================================================================

-- Create schema for audit tables (optional)
CREATE SCHEMA IF NOT EXISTS audit;
COMMENT ON SCHEMA audit IS 'Schema for audit and logging tables';

-- Grant usage
GRANT USAGE ON SCHEMA audit TO :"POSTGRES_USER";

-- Create schema for temporary data
CREATE SCHEMA IF NOT EXISTS temp_data;
COMMENT ON SCHEMA temp_data IS 'Schema for temporary data and staging tables';

-- ============================================================================
-- SECTION 9: CREATE AUDIT LOG TABLES (OPTIONAL)
-- ============================================================================

-- Audit log table for tracking all database changes
CREATE TABLE IF NOT EXISTS audit.database_changelog (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_id BIGINT DEFAULT txid_current()
);

CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit.database_changelog(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit.database_changelog(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON audit.database_changelog(operation);

COMMENT ON TABLE audit.database_changelog IS 'Audit log for all database changes';

-- Function to automatically log changes (can be attached as trigger)
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.database_changelog (table_name, operation, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.database_changelog (table_name, operation, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit.database_changelog (table_name, operation, old_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit.log_changes() IS 'Trigger function to automatically log database changes to audit table';

-- ============================================================================
-- SECTION 10: CREATE MONITORING VIEWS
-- ============================================================================

-- View to monitor database size
CREATE OR REPLACE VIEW public.database_size_info AS
SELECT
    pg_database.datname AS database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size,
    pg_database_size(pg_database.datname) AS size_bytes
FROM pg_database
WHERE pg_database.datname = current_database();

COMMENT ON VIEW public.database_size_info IS 'Monitor database size';

-- View to monitor table sizes
CREATE OR REPLACE VIEW public.table_size_info AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

COMMENT ON VIEW public.table_size_info IS 'Monitor table and index sizes';

-- View to monitor active connections
CREATE OR REPLACE VIEW public.active_connections AS
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    wait_event_type,
    wait_event,
    substring(query, 1, 100) AS query_preview
FROM pg_stat_activity
WHERE datname = current_database()
AND pid != pg_backend_pid()
ORDER BY query_start DESC;

COMMENT ON VIEW public.active_connections IS 'Monitor active database connections';

-- ============================================================================
-- SECTION 11: FINAL NOTIFICATIONS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║ ✅ DATABASE INITIALIZATION COMPLETE                                ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ Database: %                                                        ║', :'POSTGRES_DB';
    RAISE NOTICE '║ Extensions installed: uuid-ossp, pg_trgm, postgis, citext         ║';
    RAISE NOTICE '║ Custom functions created: 3                                        ║';
    RAISE NOTICE '║ Audit schema created: Yes                                          ║';
    RAISE NOTICE '║ Monitoring views created: 3                                        ║';
    RAISE NOTICE '╠════════════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ 🌾 Ready for Prisma migrations                                     ║';
    RAISE NOTICE '║ Run: npx prisma migrate deploy                                     ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END
$$;
