const ee = new node.events.EventEmitter();

function debounce(fn, delay = 0) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const handlers = {
  cursor_goto: async () => {
    const [y, x] = await nvim.client.window.cursor;
    ee.emit('cursor', { x, y });
  },
  put: debounce(async () => {
    const buffer = await nvim.client.buffer;
    const lines = await buffer.lines;
    const [y, x] = await nvim.client.window.cursor;
    ee.emit('lines', lines, { x, y });
  }),
  mode_change: ([[mode]]) => ee.emit('mode', mode),
};

nvim.client.on('notification', (method, args) => {
  if (method !== 'redraw') return;

  for (const [event, ...updates] of args) {
    const handler = handlers[event];
    if (handler !== undefined) handler(updates);
  }
});

nvim.ee = ee;
