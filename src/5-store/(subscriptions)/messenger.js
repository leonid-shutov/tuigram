// Deferred on purpose: (subscriptions) sorts before 1-dialogs and 2-chat, so neither store
// exists while this file runs — only the callback bodies may touch them.
messenger.onNewMessage((message) => {
  if (!store.dialogs.receive(message)) return;
  if (store.chat.opened() !== message.chatId) return;
  store.chat.append(message);
  // A message landing in the chat that is already on screen has been read by definition.
  store.dialogs.markRead(message.chatId);
  void messenger.readHistory(message.chatId);
});

messenger.onHistoryRead(({ chatId, isOutbox, maxReadId, unreadCount }) => {
  if (isOutbox) {
    if (store.chat.opened() === chatId) store.chat.setReadUpTo(maxReadId);
    return;
  }
  store.dialogs.setUnread(chatId, unreadCount);
});
