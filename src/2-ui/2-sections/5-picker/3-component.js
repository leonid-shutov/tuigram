// Floating overlay centered over the whole layout. Border only (no fill) to
// avoid the fill+border halo; the inner input/list carry their own backgrounds.
const wrapper = Box({
  id: 'picker',
  position: 'absolute',
  top: '15%',
  left: '20%',
  width: '60%',
  height: '55%',
  zIndex: 1000,
  visible: false,
  flexDirection: 'column',
  borderStyle: theme.borderStyle,
  customBorderChars: theme.borderChars,
  borderColor: theme.accent,
  titleColor: theme.accent,
  title: ' Jump to chat ',
});

wrapper.add(self.input);
wrapper.add(self.list);

wrapper;
