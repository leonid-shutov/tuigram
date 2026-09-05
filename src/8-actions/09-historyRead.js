/** @type {Actions['historyRead']} */
({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    // Someone read what we sent — only the open chat draws a receipt for it.
    if (store.chat.chatId === chatId && store.chat.setReadUpTo(maxReadId)) {
      ui.sections.chat.setReceipt(store.chat.receipt());
    }
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
  self.repaintDialogs();
};
