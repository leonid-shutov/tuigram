ui.screen.renderer.keyInput.on('keypress', (e) => {
  const raw = e.raw;
  if (self.selected !== 'dialogs') e.stopPropagation();

  const skip = self.selectable && self.reserved.includes(raw);
  if (!skip) ui.sections[self.selected].key?.(raw);
});
