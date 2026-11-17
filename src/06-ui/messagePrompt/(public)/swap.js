/** @type {MessagePromptSection['swap']} */
(leaving, entering) => {
  self.reset();
  const { input } = self;
  if (input.plainText === '') self.drafts.delete(leaving);
  else self.drafts.set(leaving, input.plainText);
  const text = self.drafts.get(entering) ?? '';
  input.replaceText(text);
  input.setCursor(input.lineCount - 1, (text.split('\n').at(-1) ?? '').length);
  input.placeholder = entering === null ? Locale.t('Open a chat to write') : Locale.t('Type a message...');
};
