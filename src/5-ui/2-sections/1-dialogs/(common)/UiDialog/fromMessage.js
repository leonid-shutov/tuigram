/** @type {typeof UiDialog.fromMessage} */
(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName ?? '',
  lastMessage: UiDialog.preview(message),
  unreadCount,
  isPinned: false,
  isMuted: false,
  isUnread: true,
});
