(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName,
  lastMessage: message.text,
  unreadCount,
});
