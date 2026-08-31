// The resolved theme object — the palette flattened with the derived defaults. Every UI
// layer's own `(common)/theme.js` is just `config.theme;`, so this is the single place a
// theme name turns into colors.
const defaultSenderColors = ['#e06c75', '#e5c07b', '#98c379', '#56b6c2', '#61afef', '#c678dd', '#d19a66', '#7fdbca'];

const theme = themes[source.theme ?? ''] ?? themes['aqua-lime'];

({
  ...theme.palette,
  borderStyle: theme.borderStyle,
  borderChars: theme.borderChars,
  panelWidth: theme.panelWidth,
  selfBorder: theme.selfBorder ?? theme.palette.border,
  selected: theme.selected ?? theme.palette.accent,
  senderColors: theme.senderColors ?? defaultSenderColors,
});
