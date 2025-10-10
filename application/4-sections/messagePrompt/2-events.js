const input = module.component;

nvim.on("lines", (lines) => {
  if (!input.focused) return;
  input.setContent(lines[0]);
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
