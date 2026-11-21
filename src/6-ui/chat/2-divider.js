// Only its top border draws: one row, its title the count. No fill, which would ring it.
Box({
  height: 1,
  flexShrink: 0,
  border: ['top'],
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.divider,
  titleColor: config.theme.divider,
  titleAlignment: 'center',
});
