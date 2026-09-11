/** @type {typeof KeyInput} */
({
  onKey: (handler) =>
    screen.renderer.keyInput.on('keypress', (event) => {
      event.preventDefault();
      handler(event);
    }),

  chord: (event) => `${event.ctrl ? 'ctrl+' : ''}${event.meta ? 'alt+' : ''}${event.name}`,

  modified: (event) => event.ctrl || event.meta,
});
