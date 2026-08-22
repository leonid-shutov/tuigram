async (chatId) => {
  self.clear();
  self.iterator = messenger.getHistory(chatId, 30, 20);
  const [{ value }, readUpTo] = await Promise.all([self.iterator.next(), messenger.getReadOutboxMaxId(chatId)]);
  self.readUpTo = readUpTo;
  const messages = value.toReversed();
  for (const message of messages) self.addMessage(message);
  self.selectMessage(self.messages.tail);
};
