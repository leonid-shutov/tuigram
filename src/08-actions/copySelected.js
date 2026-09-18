/** @type {Actions['copySelected']} */
() => {
  const message = ui.chat.selectedMessage;
  if (message === null) return;
  if (!screen.renderer.isOsc52Supported()) {
    OS.notify('tuigram', 'Clipboard is not supported by this terminal.');
    return;
  }
  screen.renderer.copyToClipboardOSC52(message.text);
  ui.chat.flashStatus('copied');
};
