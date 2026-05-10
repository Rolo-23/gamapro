-- Base de datos para el Sistema GAMA (Gestión del Adulto Mayor)
-- Creado para gestionar clientes, préstamos y turnos médicos

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gama_system;
USE gama_system;

-- Tabla de clientes (adultos mayores)
CREATE TABLE clientes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    donde_vive VARCHAR(200) NOT NULL,
    estado_civil ENUM('Soltero/a', 'Casado/a', 'Viudo/a', 'Divorciado/a', 'Concubinato') NOT NULL,
    condiciones_vivienda TEXT,
    maneja_tecnologia BOOLEAN DEFAULT FALSE,
    celular VARCHAR(20),
    familiar_contacto_nombre VARCHAR(200),
    familiar_contacto_telefono VARCHAR(20),
    medico_cabecera VARCHAR(200),
    fecha_nacimiento DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    INDEX idx_dni (dni),
    INDEX idx_nombre_apellido (nombre, apellido),
    INDEX idx_fecha_nacimiento (fecha_nacimiento),
    INDEX idx_activo (activo)
);

-- Tabla de préstamos
CREATE TABLE prestamos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cliente_id VARCHAR(36) NOT NULL,
    quien_presta VARCHAR(200) NOT NULL,
    item VARCHAR(200) NOT NULL,
    estado ENUM('prestado', 'devuelto') DEFAULT 'prestado',
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NULL,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_prestamo (fecha_prestamo)
);

-- Tabla de turnos/citas médicas
CREATE TABLE turnos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cliente_id VARCHAR(36) NOT NULL,
    lugar VARCHAR(200) NOT NULL,
    dia DATE NOT NULL,
    medico VARCHAR(200) NOT NULL,
    hora TIME NOT NULL,
    especialidad VARCHAR(100),
    observaciones TEXT,
    estado ENUM('programado', 'realizado', 'cancelado', 'reprogramado') DEFAULT 'programado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_dia (dia),
    INDEX idx_estado (estado),
    INDEX idx_medico (medico)
);

-- Tabla de usuarios del sistema (opcional, para futuras funcionalidades)
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'operador', 'lector') DEFAULT 'operador',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rol (rol)
);

-- Tabla de auditoría (opcional, para tracking de cambios)
CREATE TABLE auditoria (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tabla VARCHAR(50) NOT NULL,
    registro_id VARCHAR(36) NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    valores_anteriores JSON,
    valores_nuevos JSON,
    usuario_id VARCHAR(36),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tabla (tabla),
    INDEX idx_registro_id (registro_id),
    INDEX idx_fecha (fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Vista para estadísticas generales
CREATE VIEW vista_estadisticas AS
SELECT 
    COUNT(DISTINCT c.id) as total_clientes,
    COUNT(DISTINCT CASE WHEN c.maneja_tecnologia = TRUE THEN c.id END) as clientes_tecnologia,
    COUNT(DISTINCT p.id) as total_prestamos,
    COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END) as prestamos_activos,
    COUNT(DISTINCT t.id) as total_turnos,
    COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CURDATE() THEN t.id END) as turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos t ON c.id = t.cliente_id
WHERE c.activo = TRUE;

-- Vista para clientes con información resumida
CREATE VIEW vista_clientes_resumen AS
SELECT 
    c.id,
    c.dni,
    c.nombre,
    c.apellido,
    c.donde_vive,
    c.estado_civil,
    c.maneja_tecnologia,
    c.celular,
    c.familiar_contacto_nombre,
    c.medico_cabecera,
    c.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR, c.fecha_nacimiento, CURDATE()) as edad,
    COUNT(DISTINCT p.id) as total_prestamos,
    COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END) as prestamos_activos,
    COUNT(DISTINCT t.id) as total_turnos,
    COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CURDATE() THEN t.id END) as turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos t ON c.id = t.cliente_id
WHERE c.activo = TRUE
GROUP BY c.id, c.dni, c.nombre, c.apellido, c.donde_vive, c.estado_civil, 
         c.maneja_tecnologia, c.celular, c.familiar_contacto_nombre, 
         c.medico_cabecera, c.fecha_nacimiento;
