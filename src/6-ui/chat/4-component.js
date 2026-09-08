Box({
  id: 'chatWrapper',
  flexGrow: 1,
  flexDirection: 'column',
  borderStyle: config.borders.style,
  customBorderChars: config.borders.chars,
  borderColor: config.theme.border,
  bottomTitleAlignment: 'right',
  children: [self.header, self.scroll],
});
