# 🔗 Guía de Conexión Backend-Frontend

Esta guía te ayudará a conectar el backend con el frontend para que funcionen juntos.

## 📋 Requisitos Previos

1. **SQL Server** debe estar corriendo y configurado
2. **Node.js** y **npm** instalados
3. Dependencias instaladas en ambos proyectos

## 🚀 Pasos para Conectar

### 1. Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### 2. Configurar Variables de Entorno

#### Opción A: Usar el script automático

```bash
node setup-env.js
```

#### Opción B: Crear manualmente los archivos .env

**Frontend** (`.env` en la raíz del proyecto):
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Sistema GAMA
VITE_VERSION=1.0.0
```

**Backend** (`server/.env`):
```env
PORT=3001
NODE_ENV=development

DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu_password_aqui
DB_NAME=gama_system
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

CORS_ORIGIN=http://localhost:3000
```

⚠️ **IMPORTANTE**: Edita `server/.env` y configura tu contraseña real de SQL Server.

### 3. Iniciar el Backend

En una terminal:

```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Conectado a SQL Server
🚀 Servidor corriendo en http://localhost:3001
📡 API disponible en http://localhost:3001/api
```

### 4. Iniciar el Frontend

En otra terminal (desde la raíz del proyecto):

```bash
npm run dev
```

Deberías ver:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### 5. Verificar la Conexión

1. Abre tu navegador en `http://localhost:3000`
2. La aplicación debería cargar y mostrar los clientes desde la base de datos
3. Puedes probar crear, editar o eliminar clientes

## 🔍 Verificación de Conexión

### Probar el Backend directamente

```bash
# Probar el endpoint de salud
curl http://localhost:3001/api/health

# Debería responder: {"status":"ok","message":"Servidor funcionando correctamente"}
```

### Verificar en el navegador

1. Abre las **Herramientas de Desarrollador** (F12)
2. Ve a la pestaña **Network** (Red)
3. Recarga la página
4. Deberías ver peticiones a `http://localhost:3001/api/clientes`

## 🐛 Solución de Problemas

### Error: "Failed to fetch clients"

**Causa**: El backend no está corriendo o hay un problema de CORS.

**Solución**:
1. Verifica que el backend esté corriendo en el puerto 3001
2. Verifica que el archivo `.env` del frontend tenga `VITE_API_URL=http://localhost:3001/api`
3. Revisa la consola del backend para ver si hay errores

### Error: "Error conectando a SQL Server"

**Causa**: SQL Server no está corriendo o las credenciales son incorrectas.

**Solución**:
1. Verifica que SQL Server esté corriendo
2. Revisa las credenciales en `server/.env`
3. Asegúrate de que la base de datos `gama_system` exista

### Error de CORS

**Causa**: El frontend está intentando conectarse desde un puerto diferente.

**Solución**:
1. Verifica que el frontend esté corriendo en el puerto 3000
2. Si usas otro puerto, actualiza `CORS_ORIGIN` en `server/.env`

## 📊 Estructura de Conexión

```
Frontend (Puerto 3000)
    ↓
    HTTP Request
    ↓
Backend (Puerto 3001) → /api/clientes
    ↓
    SQL Query
    ↓
SQL Server (Puerto 1433)
```

## 🔧 Configuración de Puertos

- **Frontend**: Puerto 3000 (configurado en `vite.config.ts`)
- **Backend**: Puerto 3001 (configurado en `server/.env`)
- **SQL Server**: Puerto 1433 (configurado en `server/.env`)

Si necesitas cambiar los puertos, actualiza:
- `vite.config.ts` para el frontend
- `server/.env` para el backend
- `.env` del frontend para la URL del API

## ✅ Checklist de Conexión

- [ ] Dependencias instaladas en frontend y backend
- [ ] Archivo `.env` creado en la raíz del proyecto
- [ ] Archivo `server/.env` creado y configurado con credenciales de SQL Server
- [ ] SQL Server corriendo y base de datos `gama_system` creada
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] La aplicación carga datos desde la base de datos
- [ ] Puedes crear, editar y eliminar clientes

¡Listo! Tu aplicación debería estar funcionando completamente conectada. 🎉

