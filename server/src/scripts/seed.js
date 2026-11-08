const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const { initSchema } = require('../config/initSchema');

const seedUsers = async () => {
  try {
    console.log('[Seeding] Initializing database schema...');
    await initSchema();

    console.log('[Seeding] Generating seed users...');
    const saltRounds = 10;

    // 1. Prepare Admin user — read password from env, never hardcode
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword && process.env.NODE_ENV === 'production') {
      throw new Error('SEED_ADMIN_PASSWORD must be set in production');
    }
    const adminPasswordHash = await bcrypt.hash(adminPassword || 'admin', saltRounds);

    await query(
      `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username)
      DO NOTHING;
      `,
      ['admin', adminPasswordHash, 'admin']
    );
    console.log('[Seeding] Ensured admin user exists (password not overwritten on conflict)');

    // 2. Prepare user1 through user50 — only seed demo users when flag is set
    if (process.env.SEED_DEMO_USERS === 'true') {
      for (let i = 1; i <= 50; i++) {
        const username = `user${i}`;
        const password = `user${i}`;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await query(
          `
          INSERT INTO users (username, password_hash, role)
          VALUES ($1, $2, $3)
          ON CONFLICT (username)
          DO NOTHING;
          `,
          [username, passwordHash, 'user']
        );
      }

      console.log('[Seeding] Successfully seeded demo users user1 through user50.');
    }

    const res = await query('SELECT COUNT(*) FROM users;');
    console.log(`[Seeding] Total users in database: ${res.rows[0].count}`);
  } catch (error) {
    console.error('[Seeding] Failed to seed users:', error);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  seedUsers().then(() => {
    pool.end();
  });
}

module.exports = { seedUsers };
