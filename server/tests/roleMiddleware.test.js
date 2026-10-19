const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { requireRole } = require('../src/middlewares/roleMiddleware');
const { createMockReqRes } = require('./helpers');

describe('roleMiddleware - requireRole', () => {
  it('should return 401 if req.user is missing (unauthenticated)', () => {
    const middleware = requireRole(['admin']);
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { user: null },
    });

    middleware(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /authentication required/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should return 403 if user role is not in allowed roles', () => {
    const middleware = requireRole(['admin']);
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { user: { id: 1, username: 'john', role: 'user' } },
    });

    middleware(req, res, next);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.jsonData.success, false);
    assert.match(res.jsonData.message, /forbidden/i);
    assert.strictEqual(isNextCalled(), false);
  });

  it('should call next() if user has the allowed role', () => {
    const middleware = requireRole(['admin']);
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { user: { id: 1, username: 'admin', role: 'admin' } },
    });

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), true);
    assert.strictEqual(res.jsonData, null);
  });

  it('should accept a single string role instead of an array', () => {
    const middleware = requireRole('admin');
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { user: { id: 1, username: 'admin', role: 'admin' } },
    });

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), true);
  });

  it('should work when multiple roles are allowed and user has one of them', () => {
    const middleware = requireRole(['admin', 'manager', 'editor']);
    const { req, res, next, isNextCalled } = createMockReqRes({
      req: { user: { id: 2, username: 'ed', role: 'editor' } },
    });

    middleware(req, res, next);

    assert.strictEqual(isNextCalled(), true);
  });
});
