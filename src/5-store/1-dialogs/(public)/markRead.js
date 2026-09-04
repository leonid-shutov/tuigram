/** @type {DialogsStore['markRead']} */
(chatId) => {
  const dialog = self.dialogs.find(chatId);
  if (dialog === null) return;
  dialog.unreadCount = 0;
  dialog.isUnread = false;
  self.emit('changed');
};
