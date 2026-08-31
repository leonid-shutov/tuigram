/** @type {PlainEditorSelf['type']} */
(event) => {
  input.handleKeyPress(event);
  input.height = Math.max(1, input.plainText.split('\n').length);
};
