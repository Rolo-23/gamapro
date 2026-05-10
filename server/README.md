# Backend del Sistema GAMA

Backend desarrollado con Express.js y TypeScript que se conecta a SQL Server.

## Instalación

1. Instalar dependencias:
```bash
cd server
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales de SQL Server:
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

## Ejecución

### Modo desarrollo:
```bash
npm run dev
```

### Modo producción:
```bash
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3001`

## Endpoints API

### Clientes

- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener un cliente por ID
- `POST /api/clientes` - Crear un nuevo cliente
- `PUT /api/clientes/:id` - Actualizar un cliente
- `DELETE /api/clientes/:id` - Eliminar un cliente (soft delete)

### Health Check

- `GET /api/health` - Verificar estado del servidor

## Estructura

```
server/
├── src/
│   ├── config/
│   │   └── database.ts      # Configuración de conexión a SQL Server
│   ├── routes/
│   │   └── clientes.ts      # Rutas de clientes
│   ├── utils/
│   │   └── converters.ts     # Utilidades de conversión de datos
│   └── index.ts             # Punto de entrada del servidor
├── package.json
├── tsconfig.json
└── README.md
```

