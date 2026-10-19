const { query } = require('./db');

const initSchema = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `;

  try {
    await query(createTableQuery);
    console.log('[PostgreSQL] Table schema verified/initialized successfully.');
  } catch (error) {
    console.error('[PostgreSQL] Error initializing table schema:', error.message);
    throw error;
  }
};

module.exports = { initSchema };
