(message, unreadCount = 0) => ({
  chatId: message.chatId,
  name: message.chatName,
  lastMessage: Dialog.preview(message),
  unreadCount,
});
