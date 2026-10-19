const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../src/models/userModel');
const authController = require('../src/controllers/authController');
const { createMockReqRes } = require('./helpers');

describe('authController - login and getMe', () => {
  let originalFindByUsername;

  beforeEach(() => {
    originalFindByUsername = UserModel.findByUsername;
  });

  afterEach(() => {
    UserModel.findByUsername = originalFindByUsername;
  });

  describe('login', () => {
    it('should return 400 if username is missing', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { password: 'password123' } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /username and password are required/i);
    });

    it('should return 400 if password is missing', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { username: 'testuser' } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /username and password are required/i);
    });

    it('should return 401 if user does not exist', async () => {
      UserModel.findByUsername = async () => null;

      const { req, res } = createMockReqRes({
        req: { body: { username: 'nonexistent', password: 'password123' } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /invalid username or password/i);
    });

    it('should return 401 if password does not match hash', async () => {
      const passwordHash = await bcrypt.hash('correct_password', 10);
      UserModel.findByUsername = async () => ({
        id: 1,
        username: 'alice',
        password_hash: passwordHash,
        role: 'user',
        created_at: new Date().toISOString(),
      });

      const { req, res } = createMockReqRes({
        req: { body: { username: 'alice', password: 'wrong_password' } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /invalid username or password/i);
    });

    it('should return 200 with JWT and sanitized user info on successful login', async () => {
      const plainPassword = 'supersecretpassword';
      const passwordHash = await bcrypt.hash(plainPassword, 10);
      const createdAt = new Date().toISOString();

      UserModel.findByUsername = async (username) => {
        assert.strictEqual(username, 'alice');
        return {
          id: 42,
          username: 'alice',
          password_hash: passwordHash,
          role: 'admin',
          created_at: createdAt,
        };
      };

      const { req, res } = createMockReqRes({
        req: { body: { username: '  Alice  ', password: plainPassword } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.strictEqual(res.jsonData.message, 'Login successful.');
      assert.ok(typeof res.jsonData.token === 'string');

      // Verify token payload
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_2026_fullstack';
      const decoded = jwt.verify(res.jsonData.token, secret);
      assert.strictEqual(decoded.id, 42);
      assert.strictEqual(decoded.username, 'alice');
      assert.strictEqual(decoded.role, 'admin');

      // Ensure password_hash is not returned in user object
      assert.strictEqual(res.jsonData.user.password_hash, undefined);
      assert.strictEqual(res.jsonData.user.id, 42);
      assert.strictEqual(res.jsonData.user.role, 'admin');
    });

    it('should return 500 when database throws an unexpected error', async () => {
      UserModel.findByUsername = async () => {
        throw new Error('Database connection failed');
      };

      const { req, res } = createMockReqRes({
        req: { body: { username: 'alice', password: 'password123' } },
      });

      await authController.login(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /internal server error/i);
    });
  });

  describe('getMe', () => {
    it('should return 200 with req.user', async () => {
      const mockUser = { id: 10, username: 'charlie', role: 'user' };
      const { req, res } = createMockReqRes({
        req: { user: mockUser },
      });

      await authController.getMe(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.deepStrictEqual(res.jsonData.user, mockUser);
    });
  });
});
