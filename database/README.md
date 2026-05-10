# Base de Datos del Sistema GAMA

Este directorio contiene todos los archivos relacionados con la base de datos del Sistema de Gestión del Adulto Mayor (GAMA).

## Estructura de Archivos

- `schema.sql` - Esquema completo de la base de datos
- `migrations/` - Scripts de migración versionados
- `sample_data.sql` - Datos de ejemplo para poblar la base de datos
- `setup.sql` - Script de configuración inicial
- `database.ts` - Utilidades de TypeScript para conectar con la base de datos

## Configuración Inicial

### 1. Instalar MySQL o MariaDB

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Windows
# Descargar MySQL Community Server desde https://dev.mysql.com/downloads/mysql/

# macOS
brew install mysql
```

### 2. Crear la Base de Datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script de configuración
source database/setup.sql;
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gama_system
```

## Estructura de la Base de Datos

### Tablas Principales

1. **clientes** - Información de los adultos mayores
2. **prestamos** - Préstamos de elementos (sillas de ruedas, andadores, etc.)
3. **turnos** - Citas médicas y turnos
4. **usuarios** - Usuarios del sistema
5. **auditoria** - Registro de cambios (opcional)

### Vistas Útiles

- **vista_estadisticas** - Estadísticas generales del sistema
- **vista_clientes_resumen** - Resumen de clientes con conteos

## Uso en el Frontend

El archivo `database.ts` contiene utilidades para convertir entre los tipos de la base de datos y los tipos del frontend:

```typescript
import { dbClientToClient, clientToDBClient } from './database/database';

// Convertir de base de datos a frontend
const client = dbClientToClient(dbClient, loans, appointments);

// Convertir de frontend a base de datos
const dbClient = clientToDBClient(client);
```

## Migraciones

Para agregar nuevas migraciones:

1. Crear un nuevo archivo en `migrations/` con formato `XXX_descripcion.sql`
2. Incluir la versión en el nombre del archivo
3. Documentar los cambios en el archivo

## Datos de Ejemplo

El archivo `sample_data.sql` incluye:
- 3 usuarios del sistema
- 6 clientes de ejemplo
- Préstamos y turnos asociados
- Registros de auditoría de ejemplo

## Consultas Útiles

### Obtener estadísticas
```sql
SELECT * FROM vista_estadisticas;
```

### Buscar clientes por nombre
```sql
SELECT * FROM vista_clientes_resumen 
WHERE nombre LIKE '%Juan%' OR apellido LIKE '%Pérez%';
```

### Préstamos activos
```sql
SELECT c.nombre, c.apellido, p.item, p.fecha_prestamo 
FROM clientes c 
JOIN prestamos p ON c.id = p.cliente_id 
WHERE p.estado = 'prestado';
```

### Turnos pendientes
```sql
SELECT c.nombre, c.apellido, t.lugar, t.dia, t.hora, t.medico 
FROM clientes c 
JOIN turnos t ON c.id = t.cliente_id 
WHERE t.estado = 'programado' AND t.dia >= CURDATE();
```
