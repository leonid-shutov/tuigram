// A message arriving from the dispatcher. Archived chats are not in the list and must not be
// pulled into it, so the drop happens here rather than in every subscriber — the return value
// says whether the message was taken.
/** @type {DialogsStore['receive']} */
(message) => {
  if (self.isArchived(message.chatId)) return false;
  self.applyMessage(message);
  self.emit('message', message);
  return true;
};
