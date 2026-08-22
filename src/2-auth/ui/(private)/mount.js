// Auth screens are single centered panels mounted straight on `screen.wrapper` — the UI
// layer does not exist yet at this point. Only one is ever visible, so mounting a new one
// unmounts the previous, and each panel owns its key listeners: they are removed on
// dispose so they never compete with `4-ui/3-layout/(subscriptions)/keyInput.js`.
({ title, children }) => {
  if (self.current !== null) self.current.dispose();

  const box = Frame({ title, children });
  const listeners = [];

  const handle = {
    // Auth key handling is deliberately non-preventDefault: the focused InputRenderable
    // does its own typing, we only bind the navigation keys on top of it.
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
