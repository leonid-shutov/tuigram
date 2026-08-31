/** @type {NvimEditorSelf['toggleTranslit']} */
() => {
  config.translit = !config.translit;
  self.nvim.command(`set iminsert=${config.translit ? 1 : 0}`);
  events.emit('translit', config.translit);
};
