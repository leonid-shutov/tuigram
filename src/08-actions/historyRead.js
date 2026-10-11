/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    if (!store.chat.isOpen(chatId)) return;
    store.chat.setReadUpTo(maxReadId);
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
};
