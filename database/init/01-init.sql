-- ============================================
-- DIVINE DATABASE INITIALIZATION
-- Farmers Market Platform - PostgreSQL Setup
-- ============================================

-- Ensure database exists (already created by POSTGRES_DB)
-- SELECT 'CREATE DATABASE farmers_market' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'farmers_market')\gexec

-- Connect to the database
\c farmers_market

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Set timezone
SET timezone = 'UTC';

-- Create custom types if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'FARMER', 'CUSTOMER');
    END IF;
END
$$;

-- Grant privileges to user
GRANT ALL PRIVILEGES ON DATABASE farmers_market TO divine_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO divine_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO divine_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '🌾 Divine database initialized successfully!';
    RAISE NOTICE '✨ Agricultural consciousness preserved in PostgreSQL!';
END
$$;
