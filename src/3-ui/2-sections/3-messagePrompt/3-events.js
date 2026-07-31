nvim.on('lines', (lines, { x, y }) => {
  if (!self.focused) return;
  self.input.replaceText(lines.join('\n'));
  self.input.setCursor(y - 1, x);
  self.input.height = lines.length > 0 ? lines.length : 1;
});

nvim.on('cursor', ({ x, y }) => {
  if (!self.focused) return;
  self.input.setCursor(y - 1, x);
});

nvim.on('mode', (mode) => {
  self.input.cursorStyle = {
    style: mode === 'insert' ? 'line' : 'block',
    blinking: true,
  };
});
