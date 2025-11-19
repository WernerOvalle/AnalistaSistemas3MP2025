#!/bin/bash
# Script para inicializar la base de datos

# Esperar a que SQL Server esté disponible
echo "Esperando a que SQL Server esté disponible..."
sleep 30

# Ejecutar el script de esquema
echo "Ejecutando schema.sql..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -i /docker-entrypoint-initdb.d/schema.sql

# Ejecutar el script de procedimientos almacenados
echo "Ejecutando stored_procedures.sql..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${SA_PASSWORD}" -i /docker-entrypoint-initdb.d/stored_procedures.sql

echo "Base de datos inicializada correctamente"
