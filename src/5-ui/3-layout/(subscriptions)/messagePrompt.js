ui.sections.messagePrompt.on('send', async (text) => {
  if (self.openedChatId === undefined) return;
  const tempId = ui.sections.chat.addPendingMessage(text);
  const message = await messenger.sendMessage(self.openedChatId, text);
  ui.sections.chat.confirmMessage(tempId, message);
  ui.sections.dialogs.onMessage(message);
});

void ui.sections.messagePrompt.on('exit', () => self.select('chat'));
