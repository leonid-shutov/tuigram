/** @type {MessagePromptSection['send']} */
() => {
  const { input, editing } = self;
  const text = input.plainText;
  if (editing === null) {
    self.emit('send', text);
    input.replaceText('');
    input.setCursor(0, 0);
  } else {
    self.emit('edit', editing, text);
    self.clearEdit();
  }
};
