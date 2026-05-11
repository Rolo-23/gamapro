import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientesRouter from './routes/clientes';
import { getConnection, closeConnection } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'https://gamapro.vercel.app', // Añadido para Vercel
    CORS_ORIGIN
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Iniciar servidor
async function startServer() {
  try {
    await getConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
      console.log(`🐘 Base de datos: Neon PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Cierre graceful
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

startServer();
