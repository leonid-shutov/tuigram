messenger.onNewMessage((message) => {
  if (ui.sections.dialogs.isArchived(message.chatId)) return;
  ui.sections.dialogs.onMessage(message);
  if (self.openedChatId === message.chatId) {
    ui.sections.chat.addMessage(message);
    ui.sections.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId);
    // TODO: consider moving dialogs (data) out of dialogs ui section
  } else if (!message.sender.isSelf && !ui.sections.dialogs.isMuted(message.chatId)) {
    OS.notify(message.chatName, message.text || Media.placeholder(message.media) || 'New message');
  }
});

messenger.onHistoryRead(({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    if (self.openedChatId === chatId) ui.sections.chat.setReadUpTo(maxReadId);
    return;
  }
  ui.sections.dialogs.setUnread(chatId, unreadCount);
});
