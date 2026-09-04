/** @type {ChatStore['open']} */
async (chatId) => {
  if (self.chatId === chatId) return;
  // Assigned before the first await, so a second open() for the same chat while this one is
  // still loading no-ops. This is the guard 3-layout/(private)/openChat.js used to hold.
  self.chatId = chatId;
  self.clear();
  self.iterator = messenger.getHistory(chatId, 30, 20);

  // Opening a chat is reading it, and that is true from the click, not from when the history
  // finishes arriving.
  store.dialogs.markRead(chatId);
  void messenger.readHistory(chatId);

  const [{ value }, readUpTo] = await Promise.all([self.iterator.next(), messenger.getReadOutboxMaxId(chatId)]);
  // Another chat was opened while this page was in flight; that open owns the state now.
  if (self.chatId !== chatId) return;

  self.readMaxId = readUpTo;
  const messages = value.toReversed();
  for (const message of messages) self.messages.push(message);
  self.emit('opened', { chatId, messages });
};
