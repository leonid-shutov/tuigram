const { TelegramClient, proxyTransportFromUrl } = npm['@mtcute/node'];

// Reads config.credentials at call time: 5-signIn.js builds a second client from the key the
// user enters when Telegram refuses the shipped one.
/** @type {AuthSelf['createClient']} */
() => {
  // 1-credentials.js blocks on the form until both are set, so they exist by the time this runs.
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const { apiId, apiHash } = /** @type {{ apiId: string, apiHash: string }} */ (config.credentials);

  /** @type {import('@mtcute/node').TelegramClientOptions} */
  const options = {
    apiId: Number(apiId),
    apiHash,
    storage: config.paths.session,
    logLevel: 0,
    // An album arrives as one update per picture; mtcute gathers them into one message group, at
    // the cost of up to this many ms of delay on albums only. 250 is mtcute's recommended value.
    updates: { messageGroupingInterval: 250 },
  };

  if (config.proxy !== undefined) {
    try {
      const transport = proxyTransportFromUrl(config.proxy);
      options.transport = transport;
    } catch (error) {
      throw new Error('Invalid proxy', { cause: error });
    }
  }

  return new TelegramClient(options);
};
