-- =====================================================
-- Script de configuración de base de datos MarketinStrategy
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS marketing_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario y otorgar permisos
CREATE USER IF NOT EXISTS 'marketuser'@'localhost' IDENTIFIED BY 'marketpass';
GRANT ALL PRIVILEGES ON marketing_saas.* TO 'marketuser'@'localhost';
FLUSH PRIVILEGES;

-- Seleccionar la base de datos
USE marketing_saas;

-- Verificar creación
SELECT 'Base de datos configurada exitosamente!' AS Mensaje;
SHOW DATABASES LIKE 'marketing_saas';
