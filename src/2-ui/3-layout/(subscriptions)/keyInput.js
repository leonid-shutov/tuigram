void KeyInput.on('keypress', (e) => {
  const command = self.selectable && self.reserved.includes(e.raw);

  // dialogs reads its own keys; the layout consumes the rest
  if (!command && self.selected === 'dialogs') return;
  e.stopPropagation();

  if (!command) return void ui.sections[self.selected].key?.(e);

  const section = self.mapping[e.raw] ?? self.shortcuts[e.raw];
  if (section !== undefined) self.select(section);
});
