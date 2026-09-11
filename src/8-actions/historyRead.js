/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    // Someone read what we sent — only the open chat draws a receipt for it.
    if (store.chat.chatId !== chatId) return;
    store.chat.setReadUpTo(maxReadId);
    actions.repaintReceipt();
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
  self.repaintDialogs();
};
