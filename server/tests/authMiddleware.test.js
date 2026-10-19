const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const UserModel = require('../src/models/userModel');
const { verifyToken } = require('../src/middlewares/authMiddleware');
const { createMockReqRes } = require('./helpers');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_2026_fullstack';

describe('authMiddleware - verifyToken', () => {
  let originalFindById;

  beforeEach(() => {
    originalFindById = UserModel.findById;
  });

  afterEach(() => {
    UserModel.findById = originalFindById;
  });

  it('should return 401 if authorization header is missing', async () => {
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: {} },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /no token provided/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should return 401 if token is empty after "Bearer "', async () => {
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: 'Bearer    ' } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /empty token provided/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should return 401 if token is malformed / invalid', async () => {
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: 'Bearer this.is.invalid' } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /invalid or malformed token/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should return 401 if token is expired', async () => {
    // Generate token that expired 1 hour ago
    const expiredToken = jwt.sign({ id: 1, username: 'testuser' }, JWT_SECRET, {
      expiresIn: '-1h',
    });

    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: `Bearer ${expiredToken}` } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /token expired/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should return 401 if user from token no longer exists in database', async () => {
    const validToken = jwt.sign({ id: 999, username: 'deleted_user' }, JWT_SECRET, {
      expiresIn: '1h',
    });

    UserModel.findById = async () => null;

    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: `Bearer ${validToken}` } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /user no longer exists/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should set req.user and call next() with valid Bearer token', async () => {
    const mockUser = { id: 1, username: 'alice', role: 'admin' };
    const validToken = jwt.sign({ id: mockUser.id, username: mockUser.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    UserModel.findById = async (id) => {
      assert.strictEqual(id, 1);
      return mockUser;
    };

    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: `Bearer ${validToken}` } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(isNextCalled(), true);
    assert.deepStrictEqual(req.user, mockUser);
    assert.strictEqual(res.jsonData, null);
  });

  it('should support raw token without Bearer prefix', async () => {
    const mockUser = { id: 2, username: 'bob', role: 'user' };
    const validToken = jwt.sign({ id: mockUser.id, username: mockUser.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    UserModel.findById = async () => mockUser;

    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { headers: { authorization: validToken } },
    });

    await verifyToken(req, res, next);

    assert.strictEqual(isNextCalled(), true);
    assert.deepStrictEqual(req.user, mockUser);
  });
});
