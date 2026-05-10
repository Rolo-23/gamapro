# 🚀 Inicio Rápido - Sistema GAMA

## ⚠️ PROBLEMA: "localhost rechazó la conexión"

**Esto significa que los servidores NO están corriendo.**

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### Paso 1: Crear archivos de configuración

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm run setup-env
```

Luego edita `server\.env` y pon tu contraseña de SQL Server.

### Paso 2: Iniciar el BACKEND

Abre una terminal PowerShell y ejecuta:

```powershell
cd server
npm run dev
```

**ESPERA** a ver este mensaje:
```
✅ Conectado a SQL Server
🚀 Servidor corriendo en http://localhost:3001
```

**NO CIERRES ESTA TERMINAL** - Déjala abierta.

### Paso 3: Iniciar el FRONTEND

Abre **OTRA** terminal PowerShell (nueva ventana) y ejecuta:

```powershell
npm run dev
```

**ESPERA** a ver este mensaje:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

## 🌐 Abrir la Aplicación

Abre tu navegador en:
```
http://localhost:3000
```

## 📝 Resumen Visual

```
┌─────────────────────────────────────┐
│  TERMINAL 1 (Backend)               │
│  cd server                          │
│  npm run dev                        │
│  ✅ Debe mostrar:                   │
│     🚀 Servidor corriendo...        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TERMINAL 2 (Frontend)              │
│  npm run dev                        │
│  ✅ Debe mostrar:                   │
│     Local: http://localhost:3000/   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  NAVEGADOR                          │
│  http://localhost:3000              │
│  ✅ Debe mostrar la aplicación      │
└─────────────────────────────────────┘
```

## 🔧 Script Automático (Opcional)

Si prefieres, puedes usar el script:

```powershell
.\iniciar-servidores.ps1
```

Este script te ayudará a abrir las terminales automáticamente.

## ❌ Si algo no funciona

### Error: "Error conectando a SQL Server"
- Verifica que SQL Server esté corriendo
- Revisa la contraseña en `server\.env`

### Error: "Puerto 3001 ya en uso"
- Cierra otros programas que usen ese puerto
- O cambia el puerto en `server\.env`

### Error: "npm: command not found"
- Instala Node.js desde https://nodejs.org

### Los links siguen sin funcionar
1. Verifica que AMBAS terminales estén corriendo
2. Verifica que veas los mensajes de éxito en ambas
3. Espera unos segundos después de iniciar
4. Prueba `http://localhost:3001/api/health` en el navegador

## 💡 Recordatorio Importante

**SIEMPRE necesitas:**
- ✅ Terminal 1: Backend corriendo (`cd server` → `npm run dev`)
- ✅ Terminal 2: Frontend corriendo (`npm run dev`)
- ✅ Ambas terminales ABIERTAS mientras uses la app

**NO cierres las terminales** mientras uses la aplicación.

