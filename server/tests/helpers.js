process.env.NODE_ENV = 'test';

/**
 * Test helpers for mocking Express req, res, next objects
 */

function createMockReqRes(options = {}) {
  const req = {
    headers: {},
    body: {},
    params: {},
    query: {},
    user: null,
    ...options.req,
  };

  const res = {
    statusCode: 200,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    ...options.res,
  };

  let nextCalled = false;
  let nextError = null;

  const next = (err) => {
    nextCalled = true;
    nextError = err || null;
  };

  return {
    req,
    res,
    next,
    isNextCalled: () => nextCalled,
    getNextError: () => nextError,
  };
}

module.exports = {
  createMockReqRes,
};
