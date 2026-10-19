const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const UserModel = require('../src/models/userModel');
const userController = require('../src/controllers/userController');
const { createMockReqRes } = require('./helpers');

describe('userController - CRUD operations', () => {
  let originalFindAll;
  let originalCountAll;
  let originalFindById;
  let originalFindByUsername;
  let originalCreate;
  let originalUpdate;
  let originalDelete;

  beforeEach(() => {
    originalFindAll = UserModel.findAll;
    originalCountAll = UserModel.countAll;
    originalFindById = UserModel.findById;
    originalFindByUsername = UserModel.findByUsername;
    originalCreate = UserModel.create;
    originalUpdate = UserModel.update;
    originalDelete = UserModel.delete;
  });

  afterEach(() => {
    UserModel.findAll = originalFindAll;
    UserModel.countAll = originalCountAll;
    UserModel.findById = originalFindById;
    UserModel.findByUsername = originalFindByUsername;
    UserModel.create = originalCreate;
    UserModel.update = originalUpdate;
    UserModel.delete = originalDelete;
  });

  describe('getUsers', () => {
    it('should return paginated users with defaults', async () => {
      const mockUsers = [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'john', role: 'user' },
      ];

      UserModel.findAll = async ({ page, limit, search, role }) => {
        assert.strictEqual(page, 1);
        assert.strictEqual(limit, 10);
        return mockUsers;
      };

      UserModel.countAll = async () => 25;

      const { req, res } = createMockReqRes({
        req: { query: {} },
      });

      await userController.getUsers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.deepStrictEqual(res.jsonData.users, mockUsers);
      assert.deepStrictEqual(res.jsonData.pagination, {
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should clamp page to minimum 1 and limit between 1 and 100', async () => {
      UserModel.findAll = async ({ page, limit }) => {
        assert.strictEqual(page, 1);
        assert.strictEqual(limit, 100);
        return [];
      };
      UserModel.countAll = async () => 0;

      const { req, res } = createMockReqRes({
        req: { query: { page: '-5', limit: '500' } },
      });

      await userController.getUsers(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.pagination.page, 1);
      assert.strictEqual(res.jsonData.pagination.limit, 100);
    });

    it('should handle errors and return 500', async () => {
      UserModel.findAll = async () => {
        throw new Error('DB Error');
      };

      const { req, res } = createMockReqRes({ req: { query: {} } });

      await userController.getUsers(req, res);

      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /failed to retrieve users/i);
    });
  });

  describe('getUserById', () => {
    it('should return 400 for invalid/non-numeric ID', async () => {
      const { req, res } = createMockReqRes({
        req: { params: { id: 'not-a-number' } },
      });

      await userController.getUserById(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /invalid user id/i);
    });

    it('should return 404 if user is not found', async () => {
      UserModel.findById = async () => null;

      const { req, res } = createMockReqRes({
        req: { params: { id: '999' } },
      });

      await userController.getUserById(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /user not found/i);
    });

    it('should return 200 with user when user exists', async () => {
      const mockUser = { id: 5, username: 'elena', role: 'user' };
      UserModel.findById = async (id) => {
        assert.strictEqual(id, 5);
        return mockUser;
      };

      const { req, res } = createMockReqRes({
        req: { params: { id: '5' } },
      });

      await userController.getUserById(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.deepStrictEqual(res.jsonData.user, mockUser);
    });
  });

  describe('createUser', () => {
    it('should return 400 if username or password is missing', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { username: 'testuser' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.jsonData.success, false);
      assert.match(res.jsonData.message, /username and password are required/i);
    });

    it('should return 400 if username is shorter than 3 characters', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { username: 'ab', password: 'password123' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.jsonData.message, /at least 3 characters/i);
    });

    it('should return 400 if password is shorter than 4 characters', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { username: 'validuser', password: '123' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.jsonData.message, /at least 4 characters/i);
    });

    it('should return 400 if role is invalid', async () => {
      const { req, res } = createMockReqRes({
        req: { body: { username: 'validuser', password: 'password123', role: 'superadmin' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.jsonData.message, /either "admin" or "user"/i);
    });

    it('should return 409 if username already exists', async () => {
      UserModel.findByUsername = async () => ({ id: 1, username: 'existing' });

      const { req, res } = createMockReqRes({
        req: { body: { username: 'existing', password: 'password123' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.match(res.jsonData.message, /already exists/i);
    });

    it('should create user and return 201 on valid input', async () => {
      UserModel.findByUsername = async () => null;
      UserModel.create = async ({ username, password_hash, role }) => {
        assert.strictEqual(username, 'newuser');
        assert.strictEqual(role, 'admin');
        assert.ok(password_hash.startsWith('$2')); // bcrypt hash
        return { id: 10, username, role, created_at: new Date().toISOString() };
      };

      const { req, res } = createMockReqRes({
        req: { body: { username: '  NewUser  ', password: 'secretpassword', role: 'admin' } },
      });

      await userController.createUser(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.jsonData.success, true);
      assert.strictEqual(res.jsonData.user.username, 'newuser');
    });
  });

  describe('updateUser', () => {
    it('should return 400 for invalid ID', async () => {
      const { req, res } = createMockReqRes({
        req: { params: { id: 'abc' }, body: {} },
      });

      await userController.updateUser(req, res);

      assert.strictEqual(res.statusCode, 400);
    });

    it('should return 404 if user not found', async () => {
      UserModel.findById = async () => null;

      const { req, res } = createMockReqRes({
        req: { params: { id: '10' }, body: { role: 'admin' } },
      });

      await userController.updateUser(req, res);

      assert.strictEqual(res.statusCode, 404);
    });

    it('should return 409 if new username is already taken by another user', async () => {
      UserModel.findById = async () => ({ id: 5, username: 'olduser', role: 'user' });
      UserModel.findByUsername = async () => ({ id: 2, username: 'takenuser' });

      const { req, res } = createMockReqRes({
        req: { params: { id: '5' }, body: { username: 'takenuser' } },
      });

      await userController.updateUser(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.match(res.jsonData.message, /already taken/i);
    });

    it('should return 400 if new password is too short', async () => {
      UserModel.findById = async () => ({ id: 5, username: 'user5', role: 'user' });

      const { req, res } = createMockReqRes({
        req: { params: { id: '5' }, body: { password: '12' } },
      });

      await userController.updateUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.jsonData.message, /at least 4 characters/i);
    });

    it('should update user successfully and return 200', async () => {
      UserModel.findById = async () => ({ id: 5, username: 'user5', role: 'user' });
      UserModel.findByUsername = async () => null;
      UserModel.update = async (id, data) => {
        assert.strictEqual(id, 5);
        assert.strictEqual(data.username, 'updatedname');
        assert.strictEqual(data.role, 'admin');
        return { id: 5, username: 'updatedname', role: 'admin' };
      };

      const { req, res } = createMockReqRes({
        req: { params: { id: '5' }, body: { username: 'updatedname', role: 'admin' } },
      });

      await userController.updateUser(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.strictEqual(res.jsonData.user.role, 'admin');
    });
  });

  describe('deleteUser', () => {
    it('should return 400 if admin tries to delete their own account', async () => {
      const { req, res } = createMockReqRes({
        req: { params: { id: '1' }, user: { id: 1, username: 'admin' } },
      });

      await userController.deleteUser(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.match(res.jsonData.message, /cannot delete your own admin account/i);
    });

    it('should return 404 if user to delete is not found', async () => {
      UserModel.findById = async () => null;

      const { req, res } = createMockReqRes({
        req: { params: { id: '99' }, user: { id: 1, username: 'admin' } },
      });

      await userController.deleteUser(req, res);

      assert.strictEqual(res.statusCode, 404);
    });

    it('should delete user and return 200 on success', async () => {
      UserModel.findById = async () => ({ id: 7, username: 'deleted_soon' });
      let deletedId = null;
      UserModel.delete = async (id) => {
        deletedId = id;
        return true;
      };

      const { req, res } = createMockReqRes({
        req: { params: { id: '7' }, user: { id: 1, username: 'admin' } },
      });

      await userController.deleteUser(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.jsonData.success, true);
      assert.strictEqual(deletedId, 7);
      assert.strictEqual(res.jsonData.deletedId, 7);
    });
  });
});
