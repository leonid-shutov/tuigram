const { TelegramClient, proxyTransportFromUrl } = npm['@mtcute/node'];

auth.secureSession();

// 1-credentials.js runs first and blocks on the form until both are set, so they exist here.
// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
const { apiId, apiHash } = /** @type {{ apiId: string, apiHash: string }} */ (config.credentials);

/** @type {import('@mtcute/node').TelegramClientOptions} */
const options = {
  apiId: Number(apiId),
  apiHash,
  storage: config.paths.session,
  logLevel: 0,
};

if (config.proxy !== undefined) {
  try {
    const transport = proxyTransportFromUrl(config.proxy);
    options.transport = transport;
  } catch (error) {
    throw new Error('Invalid proxy', { cause: error });
  }
}

new TelegramClient(options);
