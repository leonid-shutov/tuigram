/** @type {PlainEditorSelf['type']} */
(event) => {
  const { input } = ui.sections.messagePrompt;
  input.handleKeyPress(event);
  input.height = Math.max(1, input.plainText.split('\n').length);
};
