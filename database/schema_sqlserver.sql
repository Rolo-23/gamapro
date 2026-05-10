-- Base de datos para el Sistema GAMA (Gestión del Adulto Mayor)
-- Creado para gestionar clientes, préstamos y turnos médicos
-- Script adaptado para SQL Server

-- Crear la base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'gama_system')
BEGIN
    CREATE DATABASE gama_system;
END
GO

USE gama_system;
GO

-- Tabla de clientes (adultos mayores)
CREATE TABLE clientes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    dni NVARCHAR(20) UNIQUE NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    donde_vive NVARCHAR(200) NOT NULL,
    estado_civil NVARCHAR(20) NOT NULL CHECK (estado_civil IN ('Soltero/a', 'Casado/a', 'Viudo/a', 'Divorciado/a', 'Concubinato')),
    condiciones_vivienda NVARCHAR(MAX),
    maneja_tecnologia BIT DEFAULT 0,
    celular NVARCHAR(20),
    familiar_contacto_nombre NVARCHAR(200),
    familiar_contacto_telefono NVARCHAR(20),
    medico_cabecera NVARCHAR(200),
    fecha_nacimiento DATE NOT NULL,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    activo BIT DEFAULT 1,
    
    INDEX idx_dni (dni),
    INDEX idx_nombre_apellido (nombre, apellido),
    INDEX idx_fecha_nacimiento (fecha_nacimiento),
    INDEX idx_activo (activo)
);
GO

-- Trigger para actualizar fecha_actualizacion en clientes
CREATE TRIGGER trg_clientes_actualizacion
ON clientes
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE clientes
    SET fecha_actualizacion = GETDATE()
    FROM clientes c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- Tabla de préstamos
CREATE TABLE prestamos (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    cliente_id UNIQUEIDENTIFIER NOT NULL,
    quien_presta NVARCHAR(200) NOT NULL,
    item NVARCHAR(200) NOT NULL,
    estado NVARCHAR(20) DEFAULT 'prestado' CHECK (estado IN ('prestado', 'devuelto')),
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NULL,
    observaciones NVARCHAR(MAX),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_prestamo (fecha_prestamo)
);
GO

-- Trigger para actualizar fecha_actualizacion en prestamos
CREATE TRIGGER trg_prestamos_actualizacion
ON prestamos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE prestamos
    SET fecha_actualizacion = GETDATE()
    FROM prestamos p
    INNER JOIN inserted i ON p.id = i.id;
END;
GO

-- Tabla de turnos/citas médicas
CREATE TABLE turnos (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    cliente_id UNIQUEIDENTIFIER NOT NULL,
    lugar NVARCHAR(200) NOT NULL,
    dia DATE NOT NULL,
    medico NVARCHAR(200) NOT NULL,
    hora TIME NOT NULL,
    especialidad NVARCHAR(100),
    observaciones NVARCHAR(MAX),
    estado NVARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'realizado', 'cancelado', 'reprogramado')),
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente_id (cliente_id),
    INDEX idx_dia (dia),
    INDEX idx_estado (estado),
    INDEX idx_medico (medico)
);
GO

-- Trigger para actualizar fecha_actualizacion en turnos
CREATE TRIGGER trg_turnos_actualizacion
ON turnos
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE turnos
    SET fecha_actualizacion = GETDATE()
    FROM turnos t
    INNER JOIN inserted i ON t.id = i.id;
END;
GO

-- Tabla de usuarios del sistema (opcional, para futuras funcionalidades)
CREATE TABLE usuarios (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username NVARCHAR(50) UNIQUE NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    rol NVARCHAR(20) DEFAULT 'operador' CHECK (rol IN ('admin', 'operador', 'lector')),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    ultimo_acceso DATETIME2 NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rol (rol)
);
GO

-- Tabla de auditoría (opcional, para tracking de cambios)
CREATE TABLE auditoria (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tabla NVARCHAR(50) NOT NULL,
    registro_id UNIQUEIDENTIFIER NOT NULL,
    accion NVARCHAR(10) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    valores_anteriores NVARCHAR(MAX), -- JSON como texto en SQL Server
    valores_nuevos NVARCHAR(MAX), -- JSON como texto en SQL Server
    usuario_id UNIQUEIDENTIFIER NULL,
    fecha DATETIME2 DEFAULT GETDATE(),
    
    INDEX idx_tabla (tabla),
    INDEX idx_registro_id (registro_id),
    INDEX idx_fecha (fecha),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
GO

-- Vista para estadísticas generales
CREATE VIEW vista_estadisticas AS
SELECT 
    COUNT(DISTINCT c.id) as total_clientes,
    COUNT(DISTINCT CASE WHEN c.maneja_tecnologia = 1 THEN c.id END) as clientes_tecnologia,
    COUNT(DISTINCT p.id) as total_prestamos,
    COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END) as prestamos_activos,
    COUNT(DISTINCT t.id) as total_turnos,
    COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CAST(GETDATE() AS DATE) THEN t.id END) as turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos t ON c.id = t.cliente_id
WHERE c.activo = 1;
GO

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
    DATEDIFF(YEAR, c.fecha_nacimiento, GETDATE()) as edad,
    COUNT(DISTINCT p.id) as total_prestamos,
    COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END) as prestamos_activos,
    COUNT(DISTINCT t.id) as total_turnos,
    COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CAST(GETDATE() AS DATE) THEN t.id END) as turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos t ON c.id = t.cliente_id
WHERE c.activo = 1
GROUP BY c.id, c.dni, c.nombre, c.apellido, c.donde_vive, c.estado_civil, 
         c.maneja_tecnologia, c.celular, c.familiar_contacto_nombre, 
         c.medico_cabecera, c.fecha_nacimiento;
GO

