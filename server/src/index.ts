import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientesRouter from './routes/clientes';
import { getConnection, closeConnection } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Obtenemos todos los orígenes permitidos
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// En Vercel, queremos permitir el propio dominio de Vercel (si se conoce)
// o simplemente dejar que el frontend en el mismo dominio consulte la API (CORS no se bloquea en same-origin)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://gamapro.vercel.app',
  CORS_ORIGIN
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la DB en cada petición (útil para serverless, pero Neon Pooler maneja bien las conexiones)
app.use(async (req, res, next) => {
  try {
    await getConnection();
    next();
  } catch (error) {
    console.error('Error de conexión a la BD en middleware:', error);
    next(error);
  }
});

// Rutas
app.use('/api/clientes', clientesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Servidor GAMA funcionando correctamente', db: 'Neon PostgreSQL' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

// Vercel Serverless Functions no usan app.listen()
// Comprobamos si estamos en Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`🐘 Base de datos: Neon PostgreSQL`);
  });

  // Cierre graceful local
  process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await closeConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servidor...');
    await closeConnection();
    process.exit(0);
  });
}

// Exportar la app para que Vercel la pueda ejecutar
export default app;
