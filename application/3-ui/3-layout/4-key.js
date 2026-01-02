ui.screen.on('keypress', (ch) => {
  if (!$.isReserved(ch)) {
    ui.sections[ui.layout.selected].key?.(ch);
  }
});
