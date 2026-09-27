Box({
  id: 'chatWrapper',
  focusable: true,
  flexGrow: 1,
  flexDirection: 'column',
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  focusedBorderColor: config.theme.accent,
  bottomTitleAlignment: 'right',
  children: [self.header, self.scroll],
});
