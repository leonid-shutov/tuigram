nvim.on('mode', (mode) => {
  if (mode === 'normal') $.selectable = true;
  else $.selectable = false;
});

ui.screen.on('keypress', (ch) => {
  if ($.reserved.includes(ch)) return;
});
