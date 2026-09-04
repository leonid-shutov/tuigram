store.dialogs.on('message', (message) => {
  if (self.openedChatId === message.chatId) {
    ui.sections.chat.addMessage(message);
    store.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId);
  } else if (!message.sender.isSelf && !store.dialogs.isMuted(message.chatId)) self.notifyMessage(message);
});
