process.env.NODE_ENV = 'test';
const { describe, it, beforeEach, afterEach, after } = require('node:test');
const assert = require('node:assert/strict');
const { pool } = require('../src/config/db');
const UserModel = require('../src/models/userModel');

describe('UserModel - SQL query mapping', () => {
  let originalPoolQuery;
  let lastExecutedQuery = null;
  let lastExecutedParams = null;

  beforeEach(() => {
    originalPoolQuery = pool.query;
    lastExecutedQuery = null;
    lastExecutedParams = null;
  });

  afterEach(() => {
    pool.query = originalPoolQuery;
  });

  after(async () => {
    await pool.end();
  });

  function mockDbResponse(rows = [], rowCount = 0) {
    pool.query = async (text, params) => {
      lastExecutedQuery = text;
      lastExecutedParams = params;
      return { rows, rowCount: rowCount || rows.length };
    };
  }

  describe('findByUsername', () => {
    it('should query user by username and return first row', async () => {
      const mockUser = { id: 1, username: 'testuser', role: 'user' };
      mockDbResponse([mockUser]);

      const result = await UserModel.findByUsername('testuser');

      assert.match(lastExecutedQuery, /SELECT \* FROM users WHERE username = \$1 LIMIT 1/i);
      assert.deepStrictEqual(lastExecutedParams, ['testuser']);
      assert.deepStrictEqual(result, mockUser);
    });

    it('should return null if user not found', async () => {
      mockDbResponse([]);

      const result = await UserModel.findByUsername('unknown');

      assert.strictEqual(result, null);
    });
  });

  describe('findById', () => {
    it('should query user by id without returning password_hash', async () => {
      const mockUser = { id: 5, username: 'alice', role: 'admin' };
      mockDbResponse([mockUser]);

      const result = await UserModel.findById(5);

      assert.match(lastExecutedQuery, /WHERE id = \$1/i);
      assert.doesNotMatch(lastExecutedQuery, /password_hash/i);
      assert.deepStrictEqual(lastExecutedParams, [5]);
      assert.deepStrictEqual(result, mockUser);
    });
  });

  describe('findAll', () => {
    it('should build default paginated query when no filters provided', async () => {
      mockDbResponse([]);

      await UserModel.findAll({ page: 2, limit: 10 });

      assert.match(lastExecutedQuery, /LIMIT \$1 OFFSET \$2/i);
      assert.deepStrictEqual(lastExecutedParams, [10, 10]); // limit=10, offset=(2-1)*10=10
    });

    it('should add search and role WHERE conditions and format lowercase search', async () => {
      mockDbResponse([]);

      await UserModel.findAll({ search: 'Bob', role: 'admin', page: 1, limit: 5 });

      assert.match(lastExecutedQuery, /WHERE LOWER\(username\) LIKE \$1 AND role = \$2/i);
      assert.deepStrictEqual(lastExecutedParams, ['%bob%', 'admin', 5, 0]);
    });
  });

  describe('countAll', () => {
    it('should return total count integer without filters', async () => {
      mockDbResponse([{ count: '42' }]);

      const count = await UserModel.countAll({});

      assert.match(lastExecutedQuery, /SELECT COUNT\(\*\) FROM users/i);
      assert.strictEqual(count, 42);
    });

    it('should apply filters to count query', async () => {
      mockDbResponse([{ count: '3' }]);

      const count = await UserModel.countAll({ search: 'alice', role: 'user' });

      assert.match(lastExecutedQuery, /WHERE LOWER\(username\) LIKE \$1 AND role = \$2/i);
      assert.deepStrictEqual(lastExecutedParams, ['%alice%', 'user']);
      assert.strictEqual(count, 3);
    });
  });

  describe('create', () => {
    it('should insert user and return newly created record', async () => {
      const newUser = { id: 10, username: 'newbie', role: 'user' };
      mockDbResponse([newUser]);

      const result = await UserModel.create({
        username: 'newbie',
        password_hash: 'hashed_pw',
        role: 'user',
      });

      assert.match(lastExecutedQuery, /INSERT INTO users/i);
      assert.match(lastExecutedQuery, /RETURNING id, username, role/i);
      assert.deepStrictEqual(lastExecutedParams, ['newbie', 'hashed_pw', 'user']);
      assert.deepStrictEqual(result, newUser);
    });
  });

  describe('update', () => {
    it('should dynamically update only provided fields', async () => {
      const updatedUser = { id: 3, username: 'updated_user', role: 'admin' };
      mockDbResponse([updatedUser]);

      const result = await UserModel.update(3, { username: 'updated_user', role: 'admin' });

      assert.match(lastExecutedQuery, /UPDATE users/i);
      assert.match(lastExecutedQuery, /username = \$1/i);
      assert.match(lastExecutedQuery, /role = \$2/i);
      assert.match(lastExecutedQuery, /updated_at = NOW\(\)/i);
      assert.deepStrictEqual(lastExecutedParams, ['updated_user', 'admin', 3]);
      assert.deepStrictEqual(result, updatedUser);
    });

    it('should return findById(id) if no fields were provided for update', async () => {
      const existingUser = { id: 3, username: 'user3', role: 'user' };
      mockDbResponse([existingUser]);

      const result = await UserModel.update(3, {});

      assert.match(lastExecutedQuery, /SELECT id, username, role/i);
      assert.deepStrictEqual(result, existingUser);
    });
  });

  describe('delete', () => {
    it('should return true when a record was deleted', async () => {
      mockDbResponse([{ id: 7 }], 1);

      const success = await UserModel.delete(7);

      assert.match(lastExecutedQuery, /DELETE FROM users WHERE id = \$1/i);
      assert.deepStrictEqual(lastExecutedParams, [7]);
      assert.strictEqual(success, true);
    });

    it('should return false if no row was deleted', async () => {
      mockDbResponse([], 0);

      const success = await UserModel.delete(999);

      assert.strictEqual(success, false);
    });
  });
});
