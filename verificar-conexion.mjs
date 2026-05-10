// Script para verificar la conexión del backend y frontend
import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración...\n');

// 1. Verificar archivos .env
console.log('1️⃣ Verificando archivos .env...');
const frontendEnv = path.join(__dirname, '.env');
const backendEnv = path.join(__dirname, 'server', '.env');

if (!fs.existsSync(frontendEnv)) {
  console.log('❌ No existe: .env (frontend)');
  console.log('   Ejecuta: npm run setup-env\n');
} else {
  console.log('✅ Existe: .env (frontend)');
}

if (!fs.existsSync(backendEnv)) {
  console.log('❌ No existe: server/.env (backend)');
  console.log('   Ejecuta: npm run setup-env\n');
} else {
  console.log('✅ Existe: server/.env (backend)');
}

// 2. Verificar dependencias
console.log('\n2️⃣ Verificando dependencias...');
const frontendNodeModules = path.join(__dirname, 'node_modules');
const backendNodeModules = path.join(__dirname, 'server', 'node_modules');

if (!fs.existsSync(frontendNodeModules)) {
  console.log('❌ No instaladas: dependencias del frontend');
  console.log('   Ejecuta: npm install\n');
} else {
  console.log('✅ Instaladas: dependencias del frontend');
}

if (!fs.existsSync(backendNodeModules)) {
  console.log('❌ No instaladas: dependencias del backend');
  console.log('   Ejecuta: cd server && npm install\n');
} else {
  console.log('✅ Instaladas: dependencias del backend');
}

// 3. Verificar si el backend está corriendo
console.log('\n3️⃣ Verificando si el backend está corriendo...');
const checkBackend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend está corriendo en http://localhost:3001');
          resolve(true);
        } else {
          console.log('⚠️  Backend responde pero con error:', res.statusCode);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Backend NO está corriendo');
        console.log('   El servidor rechazó la conexión');
        console.log('   Inicia el backend con: npm run dev:backend');
        console.log('   O manualmente: cd server && npm run dev\n');
      } else {
        console.log('❌ Error al conectar:', err.message);
      }
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log('❌ Timeout: El backend no responde');
      console.log('   Asegúrate de que el backend esté corriendo\n');
      resolve(false);
    });
  });
};

// 4. Verificar si el frontend está corriendo
console.log('\n4️⃣ Verificando si el frontend está corriendo...');
const checkFrontend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log('✅ Frontend está corriendo en http://localhost:3000');
      resolve(true);
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Frontend NO está corriendo');
        console.log('   Inicia el frontend con: npm run dev\n');
      } else {
        console.log('❌ Error al conectar:', err.message);
      }
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log('❌ Timeout: El frontend no responde');
      console.log('   Asegúrate de que el frontend esté corriendo\n');
      resolve(false);
    });
  });
};

// Ejecutar verificaciones
(async () => {
  await checkBackend();
  await checkFrontend();
  
  console.log('\n📋 Resumen:');
  console.log('Si el backend no está corriendo:');
  console.log('  1. Abre una terminal');
  console.log('  2. Ejecuta: npm run dev:backend');
  console.log('  3. Espera a ver: "🚀 Servidor corriendo en http://localhost:3001"');
  console.log('\nSi el frontend no está corriendo:');
  console.log('  1. Abre otra terminal');
  console.log('  2. Ejecuta: npm run dev');
  console.log('  3. Abre http://localhost:3000 en tu navegador');
  console.log('\n💡 Necesitas DOS terminales: una para el backend y otra para el frontend');
})();

