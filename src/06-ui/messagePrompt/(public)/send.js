/** @type {MessagePromptSection['send']} */
() => {
  const { input } = self;
  self.emit('send', input.plainText);
  input.replaceText('');
  input.setCursor(0, 0);
};
