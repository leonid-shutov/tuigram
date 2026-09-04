// The outbox half still lives here because the chat section, not the store, holds the read
// watermark. It moves into the store with the rest of the conversation state.
messenger.onHistoryRead(({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    if (self.openedChatId === chatId) ui.sections.chat.setReadUpTo(maxReadId);
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
});
