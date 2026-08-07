({
  // Terminal input enters the app here. OpenTUI hands the event to the focused renderable
  // *after* our listeners run, and several sections focus an input purely to render a
  // cursor — so we always suppress that. Focus is visual; key handling is ours.
  //
  // preventDefault, not stopPropagation: it blocks the focused renderable without killing
  // other global listeners (the Ctrl-L translit toggle), which would otherwise depend on
  // module load order.
  onKey: (handler) =>
    ui.screen.renderer.keyInput.on('keypress', (event) => {
      event.preventDefault();
      handler(event);
    }),
  on: (...args) => ui.screen.renderer.keyInput.on(...args),
});
