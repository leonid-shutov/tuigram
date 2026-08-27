// @ts-check
({
  /** @param {(event: import('@opentui/core').KeyEvent) => void} handler */
  onKey: (handler) =>
    screen.renderer.keyInput.on('keypress', (event) => {
      event.preventDefault();
      handler(event);
    }),
  /** @param {Parameters<import('@opentui/core').KeyHandler['on']>} args */
  on: (...args) => screen.renderer.keyInput.on(...args),
});
