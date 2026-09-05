void KeyInput.onKey((event) => {
  if (event.name === 'tab') self.cycleSection(event.shift ? -1 : 1);
  else {
    const section = ui[self.selected];
    const chord = KeyInput.chord(event);
    const target = self.shortcuts[chord]?.section ?? self.sectionShortcuts[self.selected]?.[chord];
    if (target !== undefined && !section.capturing) self.select(target);
    else section.key(event);
  }
});

ui[self.selected].focus();
