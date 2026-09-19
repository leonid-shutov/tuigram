/** @type {typeof config.themes.resolve} */
(source) => {
  const theme = config.themes.definitions[source.theme ?? config.schema.fields.theme.default];
  return {
    ...theme.palette,
    borderStyle: theme.borderStyle,
    borderChars: theme.borderChars,
    selfBorder: theme.selfBorder ?? theme.palette.border,
    selected: theme.selected ?? theme.palette.accent,
    senderColors: theme.senderColors ?? config.schema.defaults.senderColors,
  };
};
