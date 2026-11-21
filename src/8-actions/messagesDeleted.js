/** @type {Actions['messagesDeleted']} */
({ channelId, messageIds }) => {
  if (channelId !== null) return void actions.dropMessages(channelId, messageIds);
  const chatIds = new Set([...store.chat.holding(messageIds), ...store.dialogs.withLast(messageIds)]);
  for (const chatId of chatIds) {
    if (!messenger.isChannel(chatId)) actions.dropMessages(chatId, messageIds);
  }
};
