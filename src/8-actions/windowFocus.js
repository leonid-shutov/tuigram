/** @type {Actions['windowFocus']} */
() => {
  store.window.focused = true;
  const { chatId } = store.chat;
  if (chatId === null) return;
  const dialog = store.dialogs.find(chatId);
  if (dialog === null || (!dialog.isUnread && dialog.unreadCount === 0)) return;
  store.dialogs.markRead(chatId);
  self.repaintDialogs();
  void messenger.readHistory(chatId);
};
