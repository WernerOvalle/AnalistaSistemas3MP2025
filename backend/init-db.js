const sql = require('mssql');
const fs = require('fs');
const path = require('path');

const config = {
  server: process.env.DB_SERVER || 'sqlserver',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function initializeDatabase() {
  try {
    console.log('🔄 Conectando a SQL Server...');
    const pool = await sql.connect(config);

    // Verificar si la base de datos ya existe
    const dbCheck = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'DICRI_DB'
    `);

    if (dbCheck.recordset.length > 0) {
      console.log('✅ Base de datos DICRI_DB ya existe');
      await pool.close();
      return;
    }

    console.log('📝 Ejecutando schema.sql...');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Dividir por GO y ejecutar batch por batch
    const schemaBatches = schemaSQL
      .split(/^\s*GO\s*$/gim)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    for (const batch of schemaBatches) {
      await pool.request().batch(batch);
    }

    console.log('📝 Ejecutando stored_procedures.sql...');
    const spPath = path.join(__dirname, 'database', 'stored_procedures.sql');
    const spSQL = fs.readFileSync(spPath, 'utf-8');

    const spBatches = spSQL
      .split(/^\s*GO\s*$/gim)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    for (const batch of spBatches) {
      await pool.request().batch(batch);
    }

    console.log('✅ Base de datos inicializada correctamente');
    await pool.close();
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
