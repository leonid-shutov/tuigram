/** @type {typeof config.reload} */
() => {
  const file = node.fs.readFileSync(paths.settings, 'utf8');
  const source = JSON.parse(file);

  const theme = themes[source.theme ?? ''] ?? themes['aqua-lime'];
  self.theme = {
    ...theme.palette,
    borderStyle: theme.borderStyle,
    borderChars: theme.borderChars,
    selfBorder: theme.selfBorder ?? theme.palette.border,
    selected: theme.selected ?? theme.palette.accent,
    senderColors: theme.senderColors ?? defaults.senderColors,
  };
  self.hints = source.hints !== false;
  self.dialogEmoji = source.dialogEmoji !== false;
  self.imageProtocol = defaults.imageProtocols.some((protocol) => protocol === source.imageProtocol)
    ? source.imageProtocol
    : 'auto';
};
