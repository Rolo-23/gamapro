# 🔧 Solución de Problemas - "localhost rechazó la conexión"

Si ves el error **"localhost rechazó la conexión"** o **"ERR_CONNECTION_REFUSED"**, significa que el servidor no está corriendo.

## 🚨 Problema: "localhost rechazó la conexión"

### Causa Principal
El backend o frontend **NO están corriendo**. Necesitas iniciarlos manualmente.

## ✅ Solución Paso a Paso

### Paso 1: Verificar la Configuración

Ejecuta el script de verificación:

```bash
npm run verificar
```

Este script te dirá:
- ✅ Qué está funcionando
- ❌ Qué falta configurar
- 📝 Qué hacer para solucionarlo

### Paso 2: Crear Archivos .env (si no existen)

```bash
npm run setup-env
```

Luego edita `server/.env` y configura tu contraseña de SQL Server.

### Paso 3: Instalar Dependencias (si no están instaladas)

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### Paso 4: Iniciar el Backend

**IMPORTANTE:** Necesitas DOS terminales abiertas.

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Espera a ver estos mensajes:**
```
✅ Conectado a SQL Server
🚀 Servidor corriendo en http://localhost:3001
📡 API disponible en http://localhost:3001/api
```

**Si ves errores:**
- ❌ "Error conectando a SQL Server" → Verifica que SQL Server esté corriendo y las credenciales en `server/.env`
- ❌ "Puerto 3001 ya en uso" → Cierra otros programas que usen ese puerto

### Paso 5: Iniciar el Frontend

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Espera a ver:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Paso 6: Abrir en el Navegador

1. Abre `http://localhost:3000` en tu navegador
2. La aplicación debería cargar

## 🔍 Verificación Manual

### Verificar que el Backend está corriendo:

Abre en tu navegador:
```
http://localhost:3001/api/health
```

**Deberías ver:**
```json
{"status":"ok","message":"Servidor funcionando correctamente"}
```

**Si NO ves esto:**
- El backend NO está corriendo
- Vuelve al Paso 4

### Verificar que el Frontend está corriendo:

Abre en tu navegador:
```
http://localhost:3000
```

**Deberías ver:**
- La interfaz de la aplicación
- Si ves "Cargando clientes..." o datos, está funcionando

**Si NO ves esto:**
- El frontend NO está corriendo
- Vuelve al Paso 5

## 🐛 Errores Comunes

### Error: "Error conectando a SQL Server"

**Solución:**
1. Verifica que SQL Server esté corriendo
2. Abre SQL Server Management Studio y prueba conectarte
3. Verifica las credenciales en `server/.env`:
   - `DB_SERVER=localhost` (o la IP de tu servidor)
   - `DB_USER=sa` (o tu usuario)
   - `DB_PASSWORD=tu_password_real` (debe ser tu contraseña real)
   - `DB_NAME=gama_system` (debe existir la base de datos)

### Error: "Puerto 3001 ya en uso"

**Solución:**
1. Encuentra qué programa usa el puerto:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3001
   ```
2. Cierra ese programa o cambia el puerto en `server/.env`:
   ```env
   PORT=3002
   ```
3. Actualiza también `VITE_API_URL` en `.env` del frontend:
   ```env
   VITE_API_URL=http://localhost:3002/api
   ```

### Error: "Puerto 3000 ya en uso"

**Solución:**
1. Cierra otros programas que usen el puerto 3000
2. O cambia el puerto en `vite.config.ts`:
   ```typescript
   server: {
     port: 3002,  // Cambia a otro puerto
   }
   ```

### Error: "Failed to fetch clients"

**Solución:**
1. Verifica que el backend esté corriendo (Paso 4)
2. Abre la consola del navegador (F12) y revisa los errores
3. Verifica que `VITE_API_URL` en `.env` sea: `http://localhost:3001/api`

## 📋 Checklist de Verificación

Antes de abrir el navegador, verifica:

- [ ] Archivos `.env` creados (ejecuta `npm run setup-env`)
- [ ] Contraseña de SQL Server configurada en `server/.env`
- [ ] Dependencias instaladas (`npm install` en raíz y `cd server && npm install`)
- [ ] SQL Server corriendo
- [ ] Backend corriendo en Terminal 1 (ver mensaje "🚀 Servidor corriendo")
- [ ] Frontend corriendo en Terminal 2 (ver mensaje "Local: http://localhost:3000")
- [ ] `http://localhost:3001/api/health` responde correctamente
- [ ] `http://localhost:3000` muestra la aplicación

## 💡 Consejos

1. **Siempre necesitas DOS terminales:**
   - Terminal 1: Backend (`cd server && npm run dev`)
   - Terminal 2: Frontend (`npm run dev`)

2. **No cierres las terminales** mientras uses la aplicación

3. **Si cambias archivos .env**, reinicia los servidores

4. **Si algo no funciona**, ejecuta `npm run verificar` para diagnóstico

## 🆘 ¿Aún no funciona?

1. Ejecuta `npm run verificar` y comparte el resultado
2. Revisa los mensajes de error en ambas terminales
3. Verifica que SQL Server esté corriendo
4. Asegúrate de que los puertos 3000 y 3001 no estén ocupados

