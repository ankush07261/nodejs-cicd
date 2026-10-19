import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { request, api } from '../src/services/api.js';

describe('client api service', () => {
  let originalFetch;
  let originalLocalStorage;
  let storageMap = {};

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalLocalStorage = globalThis.localStorage;
    storageMap = {};

    globalThis.localStorage = {
      getItem: (key) => storageMap[key] || null,
      setItem: (key, val) => { storageMap[key] = String(val); },
      removeItem: (key) => { delete storageMap[key]; },
      clear: () => { storageMap = {}; },
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalLocalStorage;
  });

  describe('request helper', () => {
    it('should include Authorization header when token is in localStorage', async () => {
      globalThis.localStorage.setItem('token', 'sample_test_token_123');

      let capturedHeaders = null;
      globalThis.fetch = async (url, options) => {
        capturedHeaders = options.headers;
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      };

      const result = await request('/test-endpoint');

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedHeaders.Authorization, 'Bearer sample_test_token_123');
      assert.strictEqual(capturedHeaders['Content-Type'], 'application/json');
    });

    it('should not include Authorization header when token is absent', async () => {
      let capturedHeaders = null;
      globalThis.fetch = async (url, options) => {
        capturedHeaders = options.headers;
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      };

      await request('/test-endpoint');

      assert.strictEqual(capturedHeaders.Authorization, undefined);
    });

    it('should throw an error with status and data if response is not ok', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 403,
        json: async () => ({ success: false, message: 'Forbidden access' }),
      });

      try {
        await request('/forbidden');
        assert.fail('Should have thrown an error');
      } catch (err) {
        assert.strictEqual(err.status, 403);
        assert.strictEqual(err.message, 'Forbidden access');
        assert.strictEqual(err.data.success, false);
      }
    });
  });

  describe('api endpoint methods', () => {
    it('api.login sends POST to /auth/login with credentials in body', async () => {
      let capturedUrl, capturedOptions;
      globalThis.fetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
          ok: true,
          json: async () => ({ token: 'jwt_abc', user: { id: 1 } }),
        };
      };

      const res = await api.login('alice', 'password123');

      assert.ok(capturedUrl.endsWith('/auth/login'));
      assert.strictEqual(capturedOptions.method, 'POST');
      assert.deepStrictEqual(JSON.parse(capturedOptions.body), {
        username: 'alice',
        password: 'password123',
      });
      assert.strictEqual(res.token, 'jwt_abc');
    });

    it('api.getMe sends request to /auth/me', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => {
        capturedUrl = url;
        return {
          ok: true,
          json: async () => ({ user: { id: 1, username: 'alice' } }),
        };
      };

      const res = await api.getMe();

      assert.ok(capturedUrl.endsWith('/auth/me'));
      assert.strictEqual(res.user.username, 'alice');
    });

    it('api.getUsers constructs query params correctly', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => {
        capturedUrl = url;
        return {
          ok: true,
          json: async () => ({ users: [], pagination: {} }),
        };
      };

      await api.getUsers({ page: 2, limit: 15, search: 'bob', role: 'admin' });

      assert.ok(capturedUrl.includes('/users?'));
      assert.ok(capturedUrl.includes('page=2'));
      assert.ok(capturedUrl.includes('limit=15'));
      assert.ok(capturedUrl.includes('search=bob'));
      assert.ok(capturedUrl.includes('role=admin'));
    });

    it('api.getUserById sends GET to /users/:id', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => {
        capturedUrl = url;
        return {
          ok: true,
          json: async () => ({ user: { id: 7 } }),
        };
      };

      const res = await api.getUserById(7);

      assert.ok(capturedUrl.endsWith('/users/7'));
      assert.strictEqual(res.user.id, 7);
    });

    it('api.createUser sends POST to /users with userData', async () => {
      let capturedUrl, capturedOptions;
      globalThis.fetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      };

      await api.createUser({ username: 'bob', password: 'pw', role: 'user' });

      assert.ok(capturedUrl.endsWith('/users'));
      assert.strictEqual(capturedOptions.method, 'POST');
      assert.deepStrictEqual(JSON.parse(capturedOptions.body), {
        username: 'bob',
        password: 'pw',
        role: 'user',
      });
    });

    it('api.updateUser sends PUT to /users/:id', async () => {
      let capturedUrl, capturedOptions;
      globalThis.fetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      };

      await api.updateUser(5, { role: 'admin' });

      assert.ok(capturedUrl.endsWith('/users/5'));
      assert.strictEqual(capturedOptions.method, 'PUT');
      assert.deepStrictEqual(JSON.parse(capturedOptions.body), { role: 'admin' });
    });

    it('api.deleteUser sends DELETE to /users/:id', async () => {
      let capturedUrl, capturedOptions;
      globalThis.fetch = async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return {
          ok: true,
          json: async () => ({ success: true, deletedId: 9 }),
        };
      };

      const res = await api.deleteUser(9);

      assert.ok(capturedUrl.endsWith('/users/9'));
      assert.strictEqual(capturedOptions.method, 'DELETE');
      assert.strictEqual(res.deletedId, 9);
    });
  });
});
