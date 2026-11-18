Box({
  id: 'picker',
  position: 'absolute',
  alignSelf: 'center',
  top: '15%',
  width: '60%',
  maxWidth: 84,
  height: '55%',
  maxHeight: 26,
  zIndex: 1000,
  visible: false,
  flexDirection: 'column',
  // Floats over live content, so the ring around the border must be opaque. Filling with the
  // renderer's own background keeps it halo-free.
  backgroundColor: config.theme.bg,
  borderStyle: config.theme.borderStyle,
  customBorderChars: config.theme.borderChars,
  borderColor: config.theme.accent,
  titleColor: config.theme.accent,
  children: [self.search],
});
