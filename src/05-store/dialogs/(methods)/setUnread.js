/** @type {DialogsStore['setUnread']} */
(chatId, unreadCount) => {
  const dialog = self.find(chatId);
  if (dialog === null) return;
  dialog.unreadCount = unreadCount;
};
