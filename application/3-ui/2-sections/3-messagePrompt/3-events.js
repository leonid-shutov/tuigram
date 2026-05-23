nvim.on('lines', (lines) => {
  console.log({ lines });
  if (!$.input.focused) return;
  $.input.replaceText(lines.join('\n'));
});

//nvim.on('cursor', ({ x, y }) => {
//if (!input.focused) return;
//ui.screen.moveCursor(input.left + 1 + x, input.top + y);
//});
