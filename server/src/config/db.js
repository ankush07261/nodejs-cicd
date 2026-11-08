const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const dbPassword = process.env.DB_PASSWORD;

if (isProduction && !dbPassword) {
  throw new Error('[PostgreSQL] DB_PASSWORD environment variable is required in production.');
}

let sslConfig = false;
if (process.env.DB_SSL === 'true') {
  sslConfig = process.env.DB_CA_CERT
    ? { rejectUnauthorized: true, ca: process.env.DB_CA_CERT }
    : { rejectUnauthorized: false };
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: dbPassword || 'hallo',
  database: process.env.DB_NAME || 'weather_fullstack_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  allowExitOnIdle: true,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
