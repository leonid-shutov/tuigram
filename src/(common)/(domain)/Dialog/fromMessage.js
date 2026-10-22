// Telegram sends messages for chats beyond the loaded window; this synthesizes their dialog. A
// message can't tell a bot from a person or a channel from a group, so the kind is a best guess
// that folders filter on until the chat's page of the dialog list lands.
/** @type {typeof Dialog.fromMessage} */
(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName ?? '',
  lastMessage: message,
  unreadCount,
  readUpTo: 0,
  isPinned: false,
  isMuted: false,
  isUnread: true,
  isUser: false,
  kind: message.isGroup ? 'group' : 'user',
  isContact: false,
  isArchived: false,
  activity: Date.now(),
});
