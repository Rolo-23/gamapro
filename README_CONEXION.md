# Guía de Conexión Backend-Frontend

Esta guía explica cómo conectar el backend con el frontend del Sistema GAMA.

## Requisitos Previos

1. **SQL Server** instalado y corriendo
2. **Node.js** (versión 18 o superior)
3. Base de datos `gama_system` creada (usar el script `database/schema_sqlserver.sql`)

## Configuración del Backend

1. **Navegar a la carpeta del servidor:**
```bash
cd server
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
   - Copiar `env.example.txt` a `.env` (o crear manualmente)
   - Editar `.env` con tus credenciales de SQL Server:
```env
PORT=3001
NODE_ENV=development

DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu_password
DB_NAME=gama_system
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

CORS_ORIGIN=http://localhost:3000
```

4. **Iniciar el servidor:**
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3001`

## Configuración del Frontend

1. **Navegar a la raíz del proyecto:**
```bash
cd ..
```

2. **Configurar variables de entorno:**
   - Copiar `env.example` a `.env`
   - El archivo `.env` debe contener:
```env
VITE_API_URL=http://localhost:3001/api
```

3. **Iniciar el frontend:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Verificar la Conexión

1. **Verificar que el backend está funcionando:**
   - Abrir `http://localhost:3001/api/health` en el navegador
   - Deberías ver: `{"status":"ok","message":"Servidor funcionando correctamente"}`

2. **Verificar que el frontend se conecta al backend:**
   - Abrir la consola del navegador (F12)
   - El frontend debería cargar los datos desde el backend
   - Si hay errores, verificar:
     - Que el backend esté corriendo
     - Que la URL en `.env` sea correcta
     - Que CORS esté configurado correctamente

## Estructura de la API

### Endpoints disponibles:

- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener un cliente por ID
- `POST /api/clientes` - Crear un nuevo cliente
- `PUT /api/clientes/:id` - Actualizar un cliente
- `DELETE /api/clientes/:id` - Eliminar un cliente (soft delete)
- `GET /api/health` - Verificar estado del servidor

## Solución de Problemas

### Error: "Cannot connect to SQL Server"
- Verificar que SQL Server esté corriendo
- Verificar las credenciales en `.env`
- Verificar que el puerto 1433 esté abierto
- Si usas SQL Server Express, el puerto puede ser diferente

### Error: "CORS policy"
- Verificar que `CORS_ORIGIN` en el backend coincida con la URL del frontend
- Verificar que el backend esté corriendo

### Error: "Network request failed"
- Verificar que el backend esté corriendo en el puerto 3001
- Verificar que `VITE_API_URL` en el frontend sea correcta
- Verificar el firewall

## Scripts Útiles

### Iniciar ambos servidores (requiere terminales separadas):

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Notas

- El backend usa SQL Server, asegúrate de tener la base de datos creada
- El frontend ahora usa `fetch` para comunicarse con el backend
- Los datos mock ya no se usan cuando el backend está disponible
- El backend maneja todas las operaciones de base de datos

