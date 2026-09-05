// A message from a chat that was not in the list yet — Telegram sends these for chats
// beyond the loaded window.
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
