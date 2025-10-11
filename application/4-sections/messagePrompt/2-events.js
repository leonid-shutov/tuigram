const input = module.component;

//nvim.on("lines", (lines) => {
//if (!input.focused) return;
//input.setContent(lines[0]);
//screen.render();
//});

nvim.on("lines:replace", ({ first, last, data }) => {
  if (!input.focused) return;
  for (let i = 0; i < last - first; i++) input.deleteLine(first);
  for (let i = 0; i < data.length; i++) input.insertLine(first + i, data[i]);
  screen.render();
});

nvim.on("cursor", ({ x, y }) => {
  if (!input.focused) return;
  screen.moveCursor(input.left + 1 + x, input.top + y);
});

input.on("keypress", (ch, key) => {
  if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
    nvim.input(ch);
  }
});
