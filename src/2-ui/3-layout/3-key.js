KeyInput.on('keypress', (e) => {
  const command = self.selectable && self.reserved.includes(e.raw);

  // dialogs reads its own keys; the layout consumes the rest
  if (!command && self.selected === 'dialogs') return;
  e.stopPropagation();

  if (!command) ui.sections[self.selected].key?.(e);
  else if (e.name in self.mapping) self.select(self.mapping[e.name]);
});
