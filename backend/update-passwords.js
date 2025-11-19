const sql = require('mssql');
const bcrypt = require('bcryptjs');

const config = {
  server: 'sqlserver',
  port: 1433,
  database: 'DICRI_DB',
  user: 'sa',
  password: 'YourStrong@Password123',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function updatePasswords() {
  try {
    console.log('🔄 Generando hash de contraseña...');
    const hash = await bcrypt.hash('123456', 10);
    console.log('Hash generado:', hash);

    console.log('🔄 Conectando a base de datos...');
    const pool = await sql.connect(config);

    console.log('🔄 Actualizando contraseñas de usuarios...');
    await pool.request()
      .query(`UPDATE Usuarios SET password_hash = '${hash}'`);

    console.log('✅ Contraseñas actualizadas correctamente');

    const result = await pool.request()
      .query('SELECT username, password_hash FROM Usuarios');

    console.log('\nUsuarios en la base de datos:');
    result.recordset.forEach(user => {
      console.log(`  - ${user.username}: ${user.password_hash.substring(0, 20)}...`);
    });

    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updatePasswords();
