/** @type {DialogsStore['setUnread']} */
(chatId, unreadCount) => {
  const dialog = self.list.find(chatId);
  if (dialog === null) return;
  dialog.unreadCount = unreadCount;
};
