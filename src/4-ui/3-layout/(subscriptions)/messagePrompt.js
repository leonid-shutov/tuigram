ui.sections.messagePrompt.on('send', async (text) => {
  const tempId = ui.sections.chat.addPendingMessage(text);
  ui.sections.dialogs.onMessage({ chatId: self.openedChatId, text, sender: { isSelf: true } });
  const message = await messenger.sendMessage(self.openedChatId, text);
  ui.sections.chat.confirmMessage(tempId, message);
});

void ui.sections.messagePrompt.on('exit', () => self.select('chat'));
