process.env.NODE_ENV = 'test';
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');

const { pool } = require('../src/config/db');

describe('App & Integration endpoints', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });

  it('GET /api/health should return 200 with service status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.service, 'Weather Fullstack API');
    assert.ok(data.timestamp);
  });

  it('GET /api/unknown-route should return 404 with error message', async () => {
    const res = await fetch(`${baseUrl}/api/unknown-route`);
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /endpoint not found/i);
  });

  it('POST /api/auth/login without body should return 400', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();

    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  it('GET /api/users without token should return 401', async () => {
    const res = await fetch(`${baseUrl}/api/users`);
    const data = await res.json();

    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.match(data.message, /access denied/i);
  });
});
