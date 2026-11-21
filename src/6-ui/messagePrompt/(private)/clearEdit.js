/** @type {MessagePromptSelf['clearEdit']} */
() => {
  const { input } = self;
  self.editing = null;
  input.replaceText(self.draft);
  input.setCursor(0, 0);
  self.draft = '';
  self.setQuote(null);
};
