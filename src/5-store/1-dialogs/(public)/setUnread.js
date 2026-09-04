/** @type {DialogsStore['setUnread']} */
(chatId, unreadCount) => {
  const dialog = self.dialogs.find(chatId);
  if (dialog === null) return;
  dialog.unreadCount = unreadCount;
  self.emit('changed');
};
