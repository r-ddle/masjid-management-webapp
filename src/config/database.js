const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Error connecting to the PostgreSQL database', err.stack);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: async () => {
    try {
      await pool.connect();
      console.log("Successfully connected to PostgreSQL.");
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error.message);
      // Depending on the error, you might want to retry or exit
      process.exit(1); 
    }
  },
  pool // Exporting the pool itself can be useful for transactions or direct pool operations
};
