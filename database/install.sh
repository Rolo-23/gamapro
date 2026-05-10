#!/bin/bash

# Script de instalación de la base de datos para el Sistema GAMA
# Ejecutar con: bash database/install.sh

echo "🚀 Instalando base de datos para el Sistema GAMA..."

# Verificar si MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL no está instalado. Por favor instala MySQL o MariaDB primero."
    echo "Ubuntu/Debian: sudo apt install mysql-server"
    echo "macOS: brew install mysql"
    echo "Windows: Descarga desde https://dev.mysql.com/downloads/mysql/"
    exit 1
fi

# Solicitar credenciales de MySQL
echo "📝 Ingresa las credenciales de MySQL:"
read -p "Usuario (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Contraseña: " DB_PASSWORD
echo ""

read -p "Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Puerto (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

# Crear la base de datos y ejecutar migraciones
echo "🗄️  Creando base de datos y ejecutando migraciones..."

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" << EOF
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gama_system;
USE gama_system;

-- Ejecutar migración inicial
SOURCE database/migrations/001_initial_schema.sql;

-- Cargar datos de ejemplo
SOURCE database/sample_data.sql;

-- Mostrar estadísticas
SELECT 'Base de datos configurada exitosamente' as mensaje;
SELECT * FROM vista_estadisticas;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Base de datos instalada correctamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Copia env.example a .env"
    echo "2. Configura las variables de entorno en .env"
    echo "3. Establece REACT_APP_USE_DATABASE=true para usar la base de datos real"
    echo "4. Reinicia la aplicación"
    echo ""
    echo "🔗 Conexión a la base de datos:"
    echo "   Host: $DB_HOST"
    echo "   Puerto: $DB_PORT"
    echo "   Usuario: $DB_USER"
    echo "   Base de datos: gama_system"
else
    echo "❌ Error al instalar la base de datos. Verifica las credenciales y la conexión."
    exit 1
fi
