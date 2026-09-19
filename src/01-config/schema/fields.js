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
  proxy: {
    default: undefined,
    hotReload: false, // read once at boot; changing it needs a restart regardless
    validate: (value) => typeof value === 'string' && value.trim() !== '',
  },
});
