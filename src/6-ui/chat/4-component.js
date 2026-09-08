Box({
  id: 'chatWrapper',
  flexGrow: 1,
  flexDirection: 'column',
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  bottomTitleAlignment: 'right',
  children: [self.header, self.scroll],
});
