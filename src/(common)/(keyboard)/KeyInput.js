/** @type {typeof KeyInput} */
({
  onKey: (handler) =>
    screen.renderer.keyInput.on('keypress', (event) => {
      event.preventDefault();
      handler(event);
    }),

  chord: (event) => (event.ctrl ? `ctrl+${event.name}` : event.name),
});
