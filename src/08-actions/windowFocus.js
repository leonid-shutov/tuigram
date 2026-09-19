/** @type {Actions['windowFocus']} */
() => {
  store.window.focused = true;
  const { chatId } = store.chat;
  if (chatId === null) return;
  const dialog = store.dialogs.find(chatId);
  if (dialog === null || (!dialog.isUnread && dialog.unreadCount === 0)) return;
  store.dialogs.markRead(chatId);
  actions.repaintDialogs();
  void messenger.readHistory(chatId).catch((error) => Crash.soft(error));
};
