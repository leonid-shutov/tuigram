Panel({
  id: 'dialogsWrapper',
  focusable: true,
  width: screen.size.dialogsWidth,
  flexShrink: 0,
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.border,
  focusedBorderColor: config.theme.accent,
  titleColor: config.theme.muted,
  titleParts: { top: { left: ['label', 'folder'] }, bottom: { right: ['status'] } },
  children: [self.list],
});
