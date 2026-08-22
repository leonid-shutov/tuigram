const { TelegramClient } = npm['@mtcute/node'];

self.secureSession();

new TelegramClient({
  apiId: config.credentials.apiId,
  apiHash: config.credentials.apiHash,
  storage: config.paths.session,
  // mtcute defaults to WARN, written straight to `console` — which is the rendered screen.
  logLevel: 0,
});
