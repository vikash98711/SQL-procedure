const sql = require('mssql');
const config = {
  user: 'skope',
  password: 'Noida@105',
  server: '103.212.120.227',
  database: 'skope',
};

const checkDbConnection = async () => {
  try {
    const pool = await sql.connect(config);
    if (pool.connected) {
      console.log('Database connection successful');
      return pool; // Return the connection pool to be used in your routes
    } else {
      console.log('Database connection failed');
    }
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
};

module.exports = { checkDbConnection };
