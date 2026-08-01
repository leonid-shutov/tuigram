const bar = Box({
  width: '100%',
  height: 1,
  flexShrink: 0,
  paddingX: 1,
  backgroundColor: theme.surface,
});

bar.add(self.text);

self.render();

bar;
