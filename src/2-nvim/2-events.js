const handlers = {
  cursor_goto: async () => {
    const [y, x] = await nvim.client.window.cursor;
    nvim.emit('cursor', { x, y });
  },
  put: Rate.debounce(async () => {
    const buffer = await nvim.client.buffer;
    const lines = await buffer.lines;
    const [y, x] = await nvim.client.window.cursor;
    nvim.emit('lines', lines, { x, y });
  }),
  mode_change: ([[mode]]) => {
    nvim.mode = mode;
    nvim.emit('mode', mode);
  },
};

nvim.client.on('notification', (method, args) => {
  if (method !== 'redraw') return;

  for (const [event, ...updates] of args) {
    const handler = handlers[event];
    if (handler !== undefined) handler(updates);
  }
});
