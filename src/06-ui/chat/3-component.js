Panel({
  id: 'chatWrapper',
  focusable: true,
  flexGrow: 1,
  flexDirection: 'column',
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  focusedBorderColor: config.theme.accent,
  titleColor: config.theme.muted,
  titleParts: {
    top: { left: ['label', 'name'], right: ['presence'] },
    bottom: { left: ['status'], right: ['receipt'] },
  },
  children: [self.scroll],
});
