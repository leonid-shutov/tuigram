// Telegram sends messages for chats beyond the loaded window; this synthesizes their dialog.
/** @type {typeof Dialog.fromMessage} */
(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName ?? '',
  lastMessage: message,
  unreadCount,
  isPinned: false,
  isMuted: false,
  isUnread: true,
});
