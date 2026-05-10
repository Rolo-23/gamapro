-- Script de configuración inicial para el sistema GAMA
-- Este script ejecuta todas las migraciones y carga los datos de ejemplo

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gama_system;
USE gama_system;

-- Ejecutar migración inicial
SOURCE database/migrations/001_initial_schema.sql;

-- Cargar datos de ejemplo
SOURCE database/sample_data.sql;

-- Mostrar estadísticas iniciales
SELECT 'Configuración completada exitosamente' as mensaje;
SELECT * FROM vista_estadisticas;
