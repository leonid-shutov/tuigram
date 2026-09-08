Box({
  id: 'picker',
  position: 'absolute',
  top: '15%',
  left: '20%',
  width: '60%',
  height: '55%',
  zIndex: 1000,
  visible: false,
  flexDirection: 'column',
  // Floats over the chat, so it needs a fill of its own or the chat shows through the
  // border and the padding. `bg` is the terminal's own background, and opaque.
  backgroundColor: config.theme.bg,
  borderStyle: config.borders.style,
  customBorderChars: config.borders.chars,
  borderColor: config.theme.accent,
  titleColor: config.theme.accent,
  children: [self.input, self.list],
});
