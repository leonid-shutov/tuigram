// The single place a theme name turns into colors; every UI layer's `(common)/theme.js`
// is just `config.theme;`.
const theme = themes[source.theme ?? ''] ?? themes['aqua-lime'];

({
  ...theme.palette,
  borderStyle: theme.borderStyle,
  borderChars: theme.borderChars,
  selfBorder: theme.selfBorder ?? theme.palette.border,
  selected: theme.selected ?? theme.palette.accent,
  senderColors: theme.senderColors ?? defaults.senderColors,
});
