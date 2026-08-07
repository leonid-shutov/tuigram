Box({
  width: '100%',
  height: 1,
  flexShrink: 0,
  flexDirection: 'row',
  gap: 1,
  paddingX: 1,
  backgroundColor: theme.surface,
  children: [self.mode, self.translit],
});
