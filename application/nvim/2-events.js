const ee = new node.events();

const handlers = {
  cursor_goto: async () => {
    const [y, x] = await nvim.client.window.cursor;
    ee.emit("cursor", { x, y });
  },
  put: async () => {
    const buffer = await nvim.client.buffer;
    const lines = await buffer.lines;
    ee.emit("lines", lines);
  },
  mode_change: ([[mode]]) => ee.emit("mode", mode),
};

nvim.client.on("notification", (method, args) => {
  if (method !== "redraw") return;

  for (const [event, ...updates] of args) {
    const handler = handlers[event];
    if (handler !== undefined) handler(updates);
  }
});

nvim.ee = ee;
