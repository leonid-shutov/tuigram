void KeyInput.onKey((event) => {
  if (event.name === 'tab') self.cycleSection(event.shift ? -1 : 1);
  else {
    const section = ui.sections[self.selected];
    const shortcut = self.shortcuts[KeyInput.chord(event)];
    if (shortcut !== undefined && !section.capturing) self.select(shortcut.section);
    else section.key(event);
  }
});
