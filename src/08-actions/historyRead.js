/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    store.dialogs.setReadUpTo(chatId, maxReadId);
    if (store.chat.isOpen(chatId)) actions.repaintChat();
  } else store.dialogs.setUnread(chatId, unreadCount);
};
