const { query } = require('../config/db');

class UserModel {
  // Find user by username
  static async findByUsername(username) {
    const text = 'SELECT * FROM users WHERE username = $1 LIMIT 1;';
    const res = await query(text, [username]);
    return res.rows[0] || null;
  }

  // Find user by ID (excluding password_hash by default)
  static async findById(id) {
    const text = `
      SELECT id, username, role, created_at, updated_at 
      FROM users 
      WHERE id = $1 
      LIMIT 1;
    `;
    const res = await query(text, [id]);
    return res.rows[0] || null;
  }

  // Find all users with search, role filter, and pagination
  static async findAll({ search = '', role = '', page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const values = [];
    let conditions = [];

    if (search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`LOWER(username) LIKE $${values.length}`);
    }

    if (role.trim()) {
      values.push(role.trim());
      conditions.push(`role = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query records
    values.push(limit);
    const limitIndex = values.length;
    values.push(offset);
    const offsetIndex = values.length;

    const text = `
      SELECT id, username, role, created_at, updated_at 
      FROM users 
      ${whereClause} 
      ORDER BY id ASC 
      LIMIT $${limitIndex} OFFSET $${offsetIndex};
    `;

    const res = await query(text, values);
    return res.rows;
  }

  // Count total users matching filters
  static async countAll({ search = '', role = '' }) {
    const values = [];
    let conditions = [];

    if (search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`LOWER(username) LIKE $${values.length}`);
    }

    if (role.trim()) {
      values.push(role.trim());
      conditions.push(`role = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const text = `SELECT COUNT(*) FROM users ${whereClause};`;
    const res = await query(text, values);
    return parseInt(res.rows[0].count, 10);
  }

  // Create new user
  static async create({ username, password_hash, role = 'user' }) {
    const text = `
      INSERT INTO users (username, password_hash, role, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      RETURNING id, username, role, created_at, updated_at;
    `;
    const res = await query(text, [username, password_hash, role]);
    return res.rows[0];
  }

  // Update user
  static async update(id, { username, password_hash, role }) {
    const fields = [];
    const values = [];

    if (username !== undefined) {
      values.push(username);
      fields.push(`username = $${values.length}`);
    }

    if (password_hash !== undefined) {
      values.push(password_hash);
      fields.push(`password_hash = $${values.length}`);
    }

    if (role !== undefined) {
      values.push(role);
      fields.push(`role = $${values.length}`);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = NOW()');
    values.push(id);
    const text = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${values.length} 
      RETURNING id, username, role, created_at, updated_at;
    `;

    const res = await query(text, values);
    return res.rows[0] || null;
  }

  // Delete user
  static async delete(id) {
    const text = 'DELETE FROM users WHERE id = $1 RETURNING id;';
    const res = await query(text, [id]);
    return res.rowCount > 0;
  }
}

module.exports = UserModel;
