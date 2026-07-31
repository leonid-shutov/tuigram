KeyInput.on('keypress', (e) => {
  if (e.raw === Keys.CTRL_L) nvim.toggleTranslit(); // Ctrl-L
});
