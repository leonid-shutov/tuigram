/** @type {PlainEditorSelf['clear']} */
() => {
  const { input } = ui.sections.messagePrompt;
  input.replaceText('');
  input.setCursor(0, 0);
  input.height = 1;
};
