/** @type {AuthUiSelf['mount']} */
({ title, children }) => {
  if (self.current !== null) self.current.dispose();

  const box = Frame({ title, children });
  /** @type {((event: import('@opentui/core').KeyEvent) => void)[]} */
  const keyListeners = [];
  /** @type {((event: import('@opentui/core').PasteEvent) => void)[]} */
  const pasteListeners = [];

  /** @type {AuthScreenHandle} */
  const handle = {
    onKey: (handler) => {
      screen.renderer.keyInput.on('keypress', handler);
      keyListeners.push(handler);
    },
    onPaste: (handler) => {
      screen.renderer.keyInput.on('paste', handler);
      pasteListeners.push(handler);
    },
    render: () => screen.renderer.requestRender(),
    dispose: () => {
      for (const listener of keyListeners) screen.renderer.keyInput.off('keypress', listener);
      for (const listener of pasteListeners) screen.renderer.keyInput.off('paste', listener);
      keyListeners.length = 0;
      pasteListeners.length = 0;
      if (self.current !== handle) return;
      self.current = null;
      screen.wrapper.remove(box);
      box.destroy();
    },
  };

  self.current = handle;
  screen.wrapper.add(box);
  return handle;
};
