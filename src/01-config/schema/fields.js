/** @type {typeof config.schema.fields} */
({
  theme: {
    default: 'aqua-lime',
    hotReload: true,
    validate: (value) => typeof value === 'string' && value in config.themes.definitions,
  },
  dialogEmoji: {
    default: true,
    hotReload: true,
    validate: (value) => typeof value === 'boolean',
  },
  hints: {
    default: true,
    hotReload: true,
    validate: (value) => typeof value === 'boolean',
  },
  imageProtocol: {
    default: 'auto',
    hotReload: true,
    validate: (value) => config.schema.defaults.imageProtocols.some((protocol) => protocol === value),
  },
  receipt: {
    default: 'tick',
    hotReload: true,
    validate: (value) => config.schema.defaults.receipts.some((receipt) => receipt === value),
  },
  proxy: {
    default: undefined,
    hotReload: false, // read once at boot; changing it needs a restart regardless
    validate: (value) => typeof value === 'string' && value.trim() !== '',
  },
  maxWidth: {
    default: 140,
    hotReload: false, // the layout is built once at boot; changing it needs a restart
    validate: (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0,
  },
  maxHeight: {
    default: 48,
    hotReload: false, // the layout is built once at boot; changing it needs a restart
    validate: (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0,
  },
  updateCheck: {
    default: true,
    hotReload: false, // the check runs once at startup; flipping it later has nothing left to do
    validate: (value) => typeof value === 'boolean',
  },
});
