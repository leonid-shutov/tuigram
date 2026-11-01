/** @type {Actions['copySelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  if (message.text === '') return void ui.chat.flashStatus('no text');
  if (!screen.renderer.isOsc52Supported()) {
    ui.chat.flashStatus('clipboard unsupported');
    return;
  }
  screen.renderer.copyToClipboardOSC52(message.text);
  ui.chat.flashStatus('copied');
};
