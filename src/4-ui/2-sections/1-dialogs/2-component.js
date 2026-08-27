Box({
  id: 'dialogsWrapper',
  width: config.theme.panelWidth,
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  titleColor: config.theme.muted,
  children: [self.list],
});
