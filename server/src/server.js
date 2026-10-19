const app = require('./app');
const { pool } = require('./config/db');
const { initSchema } = require('./config/initSchema');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Verify DB Connection and Schema
    console.log('[Server] Connecting to PostgreSQL database...');
    const client = await pool.connect();
    console.log('[Server] Connected to PostgreSQL successfully.');
    client.release();

    await initSchema();

    // 2. Start HTTP Listener
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Server is running on: http://localhost:${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(` Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(` Users CRUD: http://localhost:${PORT}/api/users`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
