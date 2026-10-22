/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) store.dialogs.setReadUpTo(chatId, maxReadId);
  else store.dialogs.setUnread(chatId, unreadCount);
};
