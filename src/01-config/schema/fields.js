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
  messageStyle: {
    default: 'bubble',
    hotReload: true, // openConfig rebuilds the open chat's posts in the new style
    validate: (value) => config.schema.defaults.messageStyles.some((style) => style === value),
  },
  receipt: {
    default: 'tick',
    hotReload: true,
    validate: (value) => config.schema.defaults.receipts.some((receipt) => receipt === value),
  },
  language: {
    default: 'en',
    hotReload: true,
    validate: (value) => config.schema.defaults.languages.some((language) => language === value),
  },
  proxy: {
    default: undefined,
    hotReload: false, // read once at boot; changing it needs a restart regardless
    validate: (value) => typeof value === 'string' && value.trim() !== '',
  },
  updateCheck: {
    default: true,
    hotReload: false, // the check runs once at startup; flipping it later has nothing left to do
    validate: (value) => typeof value === 'boolean',
  },
});
