Box({
  id: 'dialogsWrapper',
  width: config.panelWidth,
  borderStyle: config.borders.style,
  customBorderChars: config.borders.chars,
  borderColor: config.theme.border,
  titleColor: config.theme.muted,
  children: [self.list],
});
