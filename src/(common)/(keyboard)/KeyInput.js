/** @type {typeof KeyInput} */
({
  onKey: (handler) =>
    screen.renderer.keyInput.on('keypress', (event) => {
      event.preventDefault();
      handler(event);
    }),
  on: (...args) => screen.renderer.keyInput.on(...args),
});
