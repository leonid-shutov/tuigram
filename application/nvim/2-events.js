const ee = new node.events();

const handlers = {
  cursor_goto: async () => {
    const [y, x] = await nvim.client.window.cursor;
    ee.emit("cursor", { x, y });
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

// TODO: support switching buffers
nvim.client.buffer.then((buffer) =>
  buffer.listen("lines", async () => {
    const lines = await buffer.lines;
    ee.emit("lines", lines);
  }),
);

nvim.ee = ee;
