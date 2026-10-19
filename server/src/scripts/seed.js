const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const { initSchema } = require('../config/initSchema');

const seedUsers = async () => {
  try {
    console.log('[Seeding] Initializing database schema...');
    await initSchema();

    console.log('[Seeding] Generating seed users...');
    const saltRounds = 10;

    // 1. Prepare Admin user
    const adminPasswordHash = await bcrypt.hash('admin', saltRounds);

    await query(
      `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) 
      DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
      `,
      ['admin', adminPasswordHash, 'admin']
    );
    console.log('[Seeding] Inserted/Updated admin user ("admin" / "admin")');

    // 2. Prepare user1 through user50
    for (let i = 1; i <= 50; i++) {
      const username = `user${i}`;
      const password = `user${i}`;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      await query(
        `
        INSERT INTO users (username, password_hash, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (username)
        DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
        `,
        [username, passwordHash, 'user']
      );
    }

    console.log('[Seeding] Successfully seeded users user1 through user50.');

    const res = await query('SELECT COUNT(*) FROM users;');
    console.log(`[Seeding] Total users in database: ${res.rows[0].count}`);
  } catch (error) {
    console.error('[Seeding] Failed to seed users:', error);
  }
};

if (require.main === module) {
  seedUsers().then(() => {
    pool.end();
  });
}

module.exports = { seedUsers };
