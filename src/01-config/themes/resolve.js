/** @type {typeof config.themes.resolve} */
(source) => {
  const theme = config.themes.definitions[source.theme ?? config.schema.fields.theme.default];
  return {
    ...theme.palette,
    borderStyle: theme.borderStyle,
    borderChars: theme.borderChars,
    selfBorder: theme.selfBorder ?? theme.palette.border,
    selected: theme.selected ?? theme.palette.accent,
    unread: theme.unread ?? theme.palette.accent,
    link: theme.link ?? theme.palette.accentAlt,
    code: theme.code ?? theme.palette.warning,
    senderColors: theme.senderColors ?? config.schema.defaults.senderColors,
  };
};
