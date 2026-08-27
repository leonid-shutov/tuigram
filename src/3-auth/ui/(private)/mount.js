({ title, children }) => {
  if (self.current !== null) self.current.dispose();

  const box = Frame({ title, children });
  const listeners = [];

  const handle = {
    onKey: (handler) => {
      screen.renderer.keyInput.on('keypress', handler);
      listeners.push(handler);
    },
    render: () => screen.renderer.requestRender(),
    dispose: () => {
      for (const listener of listeners) screen.renderer.keyInput.off('keypress', listener);
      listeners.length = 0;
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
