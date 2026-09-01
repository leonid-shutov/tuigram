/** @type {MessagePromptSelf['key']} */
(event) => {
  const { events, input } = ui.sections.messagePrompt;
  const { name, shift, option } = event;
  if (name === 'escape') {
    events.emit('exit');
  } else if (name === 'return' && !shift && !option) {
    events.emit('send', input.plainText);
    input.replaceText('');
    input.setCursor(0, 0);
    input.height = 1;
  } else {
    input.handleKeyPress(event);
    input.height = Math.max(1, input.plainText.split('\n').length);
  }
};
