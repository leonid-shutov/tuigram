nvim.on('lines', (lines, { x, y }) => {
  if (!$.focused) return;
  $.input.replaceText(lines.join('\n'));
  $.input.setCursor(y - 1, x);
  $.input.height = lines.length > 0 ? lines.length : 1;
});

nvim.on('cursor', ({ x, y }) => {
  if (!$.focused) return;
  $.input.setCursor(y - 1, x);
});
