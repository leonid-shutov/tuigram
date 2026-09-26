// A version check must never be worse than doing nothing: every failure path here resolves
// null rather than rejecting, so a caller never needs a try/catch around it.
const MAX_BYTES = 512 * 1024;
const TIMEOUT_MS = 5000;

/** @type {typeof Fetch.once} */
(url, headers) => {
  const { promise, resolve } = Promise.withResolvers();
  let settled = false;

  // The deadline timer is deliberately never cleared: `settled` already makes a late firing a
  // no-op, and it's unref()'d, so there is nothing to clean up by clearing it early.
  /** @param {Awaited<ReturnType<typeof Fetch.once>>} value */
  const settle = (value) => {
    if (settled) return;
    settled = true;
    resolve(value);
  };

  const request = node.https.get(url, { headers, timeout: TIMEOUT_MS }, (response) => {
    const status = response.statusCode ?? 0;

    if (status >= 300 && status < 400) {
      response.resume();
      const { location } = response.headers;
      settle({ status, location: typeof location === 'string' ? location : null, body: '' });
      return;
    }

    response.setEncoding('utf8');
    let body = '';
    response.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BYTES) {
        request.destroy();
        settle(null);
      }
    });
    response.on('end', () => settle({ status, location: null, body }));
    response.on('error', () => settle(null));
  });

  // `timeout` on the request options is socket-inactivity only, not a deadline — it has to
  // destroy the request itself to actually abort.
  request.on('timeout', () => request.destroy());
  request.on('error', () => settle(null));

  const deadline = node.timers.setTimeout(() => {
    request.destroy();
    settle(null);
  }, TIMEOUT_MS);
  deadline.unref();

  return promise;
};
