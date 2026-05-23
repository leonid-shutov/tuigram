ui.screen.renderer.keyInput.on('keypress', ({ name }) => {
  if (!$.isReserved(name)) ui.sections[$.selected].key?.(name);
});
