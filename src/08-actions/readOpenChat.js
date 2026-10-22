// The open chat, in a focused window, is read: whatever in it is unread gets marked read, here and
// on Telegram. Nothing unread, nothing to tell Telegram.
/** @type {Actions['readOpenChat']} */
() => {
  const chatId = store.chat.openChatId;
  if (chatId === null || !store.window.focused) return;
  const dialog = store.dialogs.find(chatId);
  if (dialog === null || (!dialog.isUnread && dialog.unreadCount === 0)) return;
  store.dialogs.markRead(chatId);
  void messenger.readHistory(chatId).catch((error) => Crash.soft(error));
};
