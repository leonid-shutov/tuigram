// A message from a chat the dialog list has never seen — a first contact, or a chat that was
// still below the loaded window. It becomes a dialog at the top of the unpinned list.
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
