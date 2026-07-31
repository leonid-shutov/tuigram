KeyInput.on('keypress', (e) => {
  if (self.selected !== 'dialogs') e.stopPropagation();

  const skip = self.selectable && self.reserved.includes(e.raw);
  if (!skip) ui.sections[self.selected].key?.(e.raw, e.name);
});
