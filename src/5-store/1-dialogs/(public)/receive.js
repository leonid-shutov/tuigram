// A message arriving from the dispatcher. Archived chats are not in the list and must not be
// pulled into it, so they are dropped here rather than by every subscriber.
/** @type {DialogsStore['receive']} */
(message) => {
  if (self.isArchived(message.chatId)) return;
  self.applyMessage(message);
  self.emit('message', message);
};
