ui.screen.renderer.keyInput.on('keypress', ({ raw }) => {
  console.log({ raw });
  if (!$.isReserved(raw)) ui.sections[$.selected].key?.(raw);
});
