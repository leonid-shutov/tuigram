/** @type {NvimEditorSelf['focus']} */
() => {
  const { events } = ui.sections.messagePrompt;
  events.emit('mode', self.mode ?? 'normal');
  events.emit('translit', config.translit);
  self.nvim.input('a');
};
