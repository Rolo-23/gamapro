-- ============================================================
-- GAMA - Sistema de Gestión del Adulto Mayor
-- Schema para PostgreSQL (Neon DB)
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE estado_civil_enum AS ENUM (
  'Soltero/a',
  'Casado/a',
  'Viudo/a',
  'Divorciado/a',
  'Concubinato'
);

CREATE TYPE estado_prestamo_enum AS ENUM ('prestado', 'devuelto');

CREATE TYPE estado_turno_enum AS ENUM ('programado', 'realizado', 'cancelado', 'reprogramado');

CREATE TYPE rol_usuario_enum AS ENUM ('admin', 'operador', 'lector');

CREATE TYPE accion_auditoria_enum AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ============================================================
-- TABLA: clientes
-- ============================================================

CREATE TABLE clientes (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dni                       VARCHAR(20)         UNIQUE NOT NULL,
  nombre                    VARCHAR(100)        NOT NULL,
  apellido                  VARCHAR(100)        NOT NULL,
  donde_vive                VARCHAR(200)        NOT NULL,
  estado_civil              estado_civil_enum   NOT NULL,
  condiciones_vivienda      TEXT,
  maneja_tecnologia         BOOLEAN             DEFAULT FALSE,
  celular                   VARCHAR(20),
  familiar_contacto_nombre  VARCHAR(200),
  familiar_contacto_telefono VARCHAR(20),
  medico_cabecera           VARCHAR(200),
  fecha_nacimiento          DATE                NOT NULL,
  fecha_creacion            TIMESTAMPTZ         DEFAULT NOW(),
  fecha_actualizacion       TIMESTAMPTZ         DEFAULT NOW(),
  activo                    BOOLEAN             DEFAULT TRUE
);

CREATE INDEX idx_clientes_dni             ON clientes(dni);
CREATE INDEX idx_clientes_nombre_apellido ON clientes(nombre, apellido);
CREATE INDEX idx_clientes_fecha_nac       ON clientes(fecha_nacimiento);
CREATE INDEX idx_clientes_activo          ON clientes(activo);

-- ============================================================
-- TABLA: prestamos
-- ============================================================

CREATE TABLE prestamos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID                  NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  quien_presta     VARCHAR(200)          NOT NULL,
  item             VARCHAR(200)          NOT NULL,
  estado           estado_prestamo_enum  DEFAULT 'prestado',
  fecha_prestamo   DATE                  NOT NULL,
  fecha_devolucion DATE,
  observaciones    TEXT,
  fecha_creacion   TIMESTAMPTZ           DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ        DEFAULT NOW()
);

CREATE INDEX idx_prestamos_cliente_id    ON prestamos(cliente_id);
CREATE INDEX idx_prestamos_estado        ON prestamos(estado);
CREATE INDEX idx_prestamos_fecha         ON prestamos(fecha_prestamo);

-- ============================================================
-- TABLA: turnos
-- ============================================================

CREATE TABLE turnos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id      UUID                NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  lugar           VARCHAR(200)        NOT NULL,
  dia             DATE                NOT NULL,
  medico          VARCHAR(200)        NOT NULL,
  hora            TIME                NOT NULL,
  especialidad    VARCHAR(100),
  observaciones   TEXT,
  estado          estado_turno_enum   DEFAULT 'programado',
  fecha_creacion  TIMESTAMPTZ         DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_turnos_cliente_id ON turnos(cliente_id);
CREATE INDEX idx_turnos_dia        ON turnos(dia);
CREATE INDEX idx_turnos_estado     ON turnos(estado);
CREATE INDEX idx_turnos_medico     ON turnos(medico);

-- ============================================================
-- TABLA: usuarios (para futuras funcionalidades)
-- ============================================================

CREATE TABLE usuarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username       VARCHAR(50)         UNIQUE NOT NULL,
  email          VARCHAR(100)        UNIQUE NOT NULL,
  password_hash  VARCHAR(255)        NOT NULL,
  nombre         VARCHAR(100)        NOT NULL,
  apellido       VARCHAR(100)        NOT NULL,
  rol            rol_usuario_enum    DEFAULT 'operador',
  activo         BOOLEAN             DEFAULT TRUE,
  fecha_creacion TIMESTAMPTZ         DEFAULT NOW(),
  ultimo_acceso  TIMESTAMPTZ
);

CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email    ON usuarios(email);
CREATE INDEX idx_usuarios_rol      ON usuarios(rol);

-- ============================================================
-- TABLA: auditoria
-- ============================================================

CREATE TABLE auditoria (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla               VARCHAR(50)             NOT NULL,
  registro_id         UUID                    NOT NULL,
  accion              accion_auditoria_enum   NOT NULL,
  valores_anteriores  JSONB,
  valores_nuevos      JSONB,
  usuario_id          UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fecha               TIMESTAMPTZ             DEFAULT NOW()
);

CREATE INDEX idx_auditoria_tabla       ON auditoria(tabla);
CREATE INDEX idx_auditoria_registro_id ON auditoria(registro_id);
CREATE INDEX idx_auditoria_fecha       ON auditoria(fecha);

-- ============================================================
-- FUNCIÓN: actualizar fecha_actualizacion automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_prestamos_updated_at
  BEFORE UPDATE ON prestamos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_turnos_updated_at
  BEFORE UPDATE ON turnos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VISTA: estadísticas generales
-- ============================================================

CREATE OR REPLACE VIEW vista_estadisticas AS
SELECT
  COUNT(DISTINCT c.id)                                                        AS total_clientes,
  COUNT(DISTINCT CASE WHEN c.maneja_tecnologia = TRUE THEN c.id END)          AS clientes_tecnologia,
  COUNT(DISTINCT p.id)                                                        AS total_prestamos,
  COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END)               AS prestamos_activos,
  COUNT(DISTINCT t.id)                                                        AS total_turnos,
  COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CURRENT_DATE THEN t.id END) AS turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos    t ON c.id = t.cliente_id
WHERE c.activo = TRUE;

-- ============================================================
-- VISTA: clientes con resumen
-- ============================================================

CREATE OR REPLACE VIEW vista_clientes_resumen AS
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
  DATE_PART('year', AGE(c.fecha_nacimiento))                                         AS edad,
  COUNT(DISTINCT p.id)                                                               AS total_prestamos,
  COUNT(DISTINCT CASE WHEN p.estado = 'prestado' THEN p.id END)                      AS prestamos_activos,
  COUNT(DISTINCT t.id)                                                               AS total_turnos,
  COUNT(DISTINCT CASE WHEN t.estado = 'programado' AND t.dia >= CURRENT_DATE THEN t.id END) AS turnos_pendientes
FROM clientes c
LEFT JOIN prestamos p ON c.id = p.cliente_id
LEFT JOIN turnos    t ON c.id = t.cliente_id
WHERE c.activo = TRUE
GROUP BY c.id, c.dni, c.nombre, c.apellido, c.donde_vive, c.estado_civil,
         c.maneja_tecnologia, c.celular, c.familiar_contacto_nombre,
         c.medico_cabecera, c.fecha_nacimiento;
