Box({
  id: 'dialogsWrapper',
  focusable: true,
  width: config.theme.panelWidth,
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  focusedBorderColor: config.theme.accent,
  titleColor: config.theme.muted,
  bottomTitleAlignment: 'right',
  children: [self.list],
});
