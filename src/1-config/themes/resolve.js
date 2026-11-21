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
    divider: theme.divider ?? theme.palette.warning,
    link: theme.link ?? theme.palette.accentAlt,
    code: theme.code ?? theme.palette.warning,
    thumb: theme.thumb ?? theme.palette.fg,
    senderColors: theme.senderColors ?? config.schema.defaults.senderColors,
  };
};
