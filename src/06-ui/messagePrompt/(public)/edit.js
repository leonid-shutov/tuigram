/** @type {MessagePromptSection['edit']} */
(messageId, text) => {
  self.takeReply();
  const { input } = self;
  self.draft = input.plainText;
  self.editing = messageId;
  input.replaceText(text);
  input.setCursor(input.lineCount - 1, (text.split('\n').at(-1) ?? '').length);
  self.setQuote({ color: config.theme.accent, head: '✎ Editing', body: text === '' ? null : text, italic: false });
};
