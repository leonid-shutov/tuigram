void KeyInput.onKey((event) => {
  const section = ui.sections[self.selected];
  const shortcut = self.shortcuts[event.raw];
  if (shortcut !== undefined && !section.capturing) self.select(shortcut.section);
  else section.key(event);
});
