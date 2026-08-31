/** @type {NvimEditorSelf['focus']} */
() => {
  events.emit('mode', self.mode ?? 'normal');
  events.emit('translit', config.translit);
  self.nvim.input('a');
};
