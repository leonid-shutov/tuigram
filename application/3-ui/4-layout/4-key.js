ui.screen.renderer.keyInput.on('keypress', (e) => {
  const raw = e.raw;
  if (self.selected === 'messagePrompt') e.stopPropagation();
  if (self.selected === 'chat') e.stopPropagation();
  if (!self.isReserved(raw)) ui.sections[self.selected].key?.(raw);
});
