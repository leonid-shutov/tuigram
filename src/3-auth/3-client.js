const { TelegramClient } = npm['@mtcute/node'];

self.secureSession();

// 1-credentials.js runs first and blocks on the form until both are set, so they exist here.
// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
const { apiId, apiHash } = /** @type {{ apiId: string, apiHash: string }} */ (config.credentials);

new TelegramClient({
  // Every source of an api_id is textual (env var, JSON file, the form); mtcute wants a number.
  apiId: Number(apiId),
  apiHash,
  storage: config.paths.session,
  // mtcute defaults to WARN, written straight to `console` — which is the rendered screen.
  logLevel: 0,
});
