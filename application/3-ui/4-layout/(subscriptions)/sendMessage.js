ui.sections.messagePrompt.on('send', async (text) => {
  const tempId = ui.sections.chat.addPendingMessage(text);
  const message = await messenger.sendMessage(self.openedChatId, text);
  ui.sections.chat.confirmMessage(tempId, message);
});
