// A dedicated row rather than a hints-bar entry: it survives `hints: false`, and it never
// competes with the hint bar's width budget or shifts a section's own keys. Normal flow, no
// border, so no zIndex and no fill+border halo to worry about.
Box({
  id: 'updateNotification',
  width: '100%',
  height: 1,
  flexShrink: 0,
  visible: false,
  backgroundColor: config.theme.bg,
  children: [self.text],
});
