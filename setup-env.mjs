// Script para crear archivos .env desde los ejemplos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Configurando archivos .env...\n');

// Frontend .env
const frontendEnvPath = path.join(__dirname, '.env');
const frontendEnvExample = `# Configuración de la aplicación Frontend
# URL del backend API
VITE_API_URL=http://localhost:3001/api

# Configuración de la aplicación
VITE_APP_NAME=Sistema GAMA
VITE_VERSION=1.0.0
`;

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvExample);
  console.log('✅ Creado: .env (frontend)');
} else {
  console.log('⚠️  Ya existe: .env (frontend)');
}

// Backend .env
const backendEnvPath = path.join(__dirname, 'server', '.env');
const backendEnvExample = `# Configuración del servidor
PORT=3001
NODE_ENV=development

# Configuración de SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=tu_password_aqui
DB_NAME=gama_system
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# CORS - Permitir conexiones desde el frontend
CORS_ORIGIN=http://localhost:3000
`;

if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnvExample);
  console.log('✅ Creado: server/.env (backend)');
  console.log('\n⚠️  IMPORTANTE: Edita server/.env y configura tu contraseña de SQL Server');
} else {
  console.log('⚠️  Ya existe: server/.env (backend)');
}

console.log('\n✨ Configuración completada!');
console.log('\n📝 Próximos pasos:');
console.log('1. Edita server/.env y configura tu contraseña de SQL Server');
console.log('2. Asegúrate de que SQL Server esté corriendo');
console.log('3. Ejecuta el backend: cd server && npm run dev');
console.log('4. Ejecuta el frontend: npm run dev');

