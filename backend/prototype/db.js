const mysql = require('mysql');
const dbConfig = require('../config/db.config.js');

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  connectionLimit: 10, // Limits max concurrent connections
  waitForConnections: true, // Queue requests instead of failing immediately
  queueLimit: 0 // No limit to the number of queued requests
});

// Handle connection errors
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database Connection Error:', err);
    return;
  }
  console.log('MySQL Database Connected!');
  connection.release(); // Release connection back to pool
});

// Gracefully handle shutdown
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) console.error('Error closing MySQL pool:', err);
    else console.log('MySQL pool closed.');
    process.exit(0);
  });
});

module.exports = pool;
