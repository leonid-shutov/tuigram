screen.on("keypress", (ch) => {
  if (!module.isReserved(ch)) {
    sections[layout.selected].key?.(ch);
  }
});
