messenger.on('message', (message) => {
  ui.sections.dialogs.onMessage(message);
  if (self.openedChatId === message.chatId) {
    ui.sections.chat.addMessage(message);
    ui.sections.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId);
  }
});
