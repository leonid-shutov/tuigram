/** @type {typeof config.schema.resolveDefaults} */
() => {
  /** @type {Record<string, unknown>} */
  const resolved = {};
  for (const [key, field] of Object.entries(config.schema.fields)) {
    const value = config.source[key] ?? field.default;
    if (value !== undefined) resolved[key] = value;
  }
  return resolved;
};
