/** @type {Actions['copySelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  if (!screen.renderer.isOsc52Supported()) {
    ui.chat.flashStatus('clipboard unsupported');
    return;
  }
  screen.renderer.copyToClipboardOSC52(message.text);
  ui.chat.flashStatus('copied');
};
