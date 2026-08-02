const bar = Box({
  width: '100%',
  height: 1,
  flexShrink: 0,
  flexDirection: 'row',
  gap: 1,
  paddingX: 1,
  backgroundColor: theme.surface,
});

bar.add(self.mode);
bar.add(self.translit);

bar;
