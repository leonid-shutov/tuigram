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
  bottomTitleAlignment: 'right',
  titleParts: { top: ['label', 'folder'], bottom: ['status'] },
  children: [self.list],
});
