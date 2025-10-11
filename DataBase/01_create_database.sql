-- =====================================================
-- Script de creación de la base de datos
-- Sistema de Gestión del Congreso de Tecnología
-- =====================================================

-- Crear la base de datos
CREATE DATABASE congreso_tecnologia
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Conectar a la base de datos
\c congreso_tecnologia;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comentario de la base de datos
COMMENT ON DATABASE congreso_tecnologia IS 'Base de datos para el Sistema de Gestión del Congreso de Tecnología';
