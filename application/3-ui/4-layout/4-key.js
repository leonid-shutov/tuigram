ui.screen.renderer.keyInput.on('keypress', (e) => {
  const raw = e.raw;
  if ($.selected === 'messagePrompt') e.stopPropagation();
  if ($.selected === 'chat') e.stopPropagation();
  if (!$.isReserved(raw)) ui.sections[$.selected].key?.(raw);
});
