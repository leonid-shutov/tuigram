/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) store.dialogs.readOutbox(chatId, maxReadId);
  else store.dialogs.readInbox(chatId, maxReadId, unreadCount);
};
