KeyInput.on('keypress', (e) => {
  if (e.raw === Keys.CTRL_L) self.toggleTranslit();
});

self.nvim.command('set keymap=russian-jcuken');
if (!config.translit) self.toggleTranslit();
