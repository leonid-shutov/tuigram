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
//nvim.client.buffer.then((buffer) =>
//buffer.listen("lines", async (...args) => {
//console.dir({ args });
//const lines = await buffer.lines;
//ee.emit("lines", lines);
//}),
//);

nvim.client.buffer.then((buffer) =>
  buffer.listen("lines", async (_buf, _tick, first, last, data, more) => {
    if (more) throw new Error("Multi-part updates are not supported");
    const updatedLines = Array.from(
      { length: last - first },
      (v, i) => first + i,
    );
    if (
      first !== last &&
      last === first + 1 &&
      data.length === 1 &&
      data[0] === ""
    ) {
      ee.emit("buffer:change", {
        type: "clear",
        first,
        last,
        data: [""],
      });
    } else if (first !== last && data.length === 1 && data[0] === "") {
      ee.emit("buffer:change", {
        type: "delete-multiple-empty",
        first,
        last,
        data: [""],
      });
    } else if (first !== last && data.length === 0) {
      ee.emit("buffer:change", {
        type: "delete",
        first,
        last,
        data: [],
      });
    } else if (first === last) {
      if (first > 0 && data.length === 0) data.unshift("");
      ee.emit("buffer:change", {
        type: "insert",
        first,
        last,
        data: [...data],
      });
    } else {
      if (first >= 0 && data.length === 0) data.unshift("");
      ee.emit("lines:replace", {
        first,
        last,
        data: [...data],
      });
    }
  }),
);

nvim.ee = ee;
