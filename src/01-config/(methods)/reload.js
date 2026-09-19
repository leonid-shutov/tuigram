/** @type {typeof config.reload} */
() => {
  const fresh = config.schema.resolveConfig();
  config.source = fresh;
  self.theme = config.themes.resolve(fresh);
  for (const [key, field] of Object.entries(config.schema.fields)) {
    if (key === 'theme' || !field.hotReload) continue;
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    /** @type {Record<string, unknown>} */ (self)[key] = fresh[key] ?? field.default;
  }
};
