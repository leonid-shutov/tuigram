/** @type {NvimEditorSelf['send']} */
() => {
  const { events, input } = ui.sections.messagePrompt;
  events.emit('send', input.plainText);
  self.clear();
};
