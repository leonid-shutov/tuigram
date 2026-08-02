const wrapper = Box({
  borderStyle: theme.borderStyle,
  customBorderChars: theme.borderChars,
  borderColor: theme.border,
  titleColor: theme.muted,
  flexShrink: 0,
});

wrapper.add(input);

wrapper;
