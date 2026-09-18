/** @type {MessagePromptSection['edit']} */
(messageId, text) => {
  const { input } = self;
  self.draft = input.plainText;
  self.editing = messageId;
  input.replaceText(text);
  input.setCursor(input.lineCount - 1, (text.split('\n').at(-1) ?? '').length);
  self.component.bottomTitle = ' editing ';
};
