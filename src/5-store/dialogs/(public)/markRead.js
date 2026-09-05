/** @type {DialogsStore['markRead']} */
(chatId) => {
  const dialog = self.list.find(chatId);
  if (dialog === null) return;
  dialog.unreadCount = 0;
  dialog.isUnread = false;
};
