/** @type {PlainEditorSelf['exit']} */
() => {
  ui.sections.messagePrompt.events.emit('exit');
};
