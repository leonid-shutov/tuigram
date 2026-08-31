/** @type {NvimEditorSelf['send']} */
() => {
  events.emit('send', input.plainText);
  self.clear();
};
