/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    if (store.chat.chatId !== chatId) return;
    store.chat.setReadUpTo(maxReadId);
    actions.repaintChat();
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
};
