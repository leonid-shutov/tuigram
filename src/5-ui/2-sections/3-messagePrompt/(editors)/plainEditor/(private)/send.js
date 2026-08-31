/** @type {PlainEditorSelf['send']} */
() => {
  events.emit('send', input.plainText);
  self.clear();
};
