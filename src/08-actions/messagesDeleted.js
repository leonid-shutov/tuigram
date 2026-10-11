// Only a channel's update names its chat; elsewhere an id is the account's, so every chat that
// holds one is a candidate: the open chat and the dialogs previewing it, channels aside.
/** @type {Actions['messagesDeleted']} */
({ channelId, messageIds }) => {
  if (channelId !== null) return void actions.dropMessages(channelId, messageIds);
  const open = store.chat.chatId;
  const previewed = store.dialogs.withLast(messageIds);
  const chatIds = new Set(open === null ? previewed : [open, ...previewed]);
  for (const chatId of chatIds) {
    if (!messenger.isChannel(chatId)) actions.dropMessages(chatId, messageIds);
  }
};
