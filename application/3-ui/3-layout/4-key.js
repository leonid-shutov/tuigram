ui.screen.renderer.keyInput.on('keypress', (e) => {
  const raw = e.raw;
  e.stopPropagation();
  if (!$.isReserved(raw)) ui.sections[$.selected].key?.(raw);
});
