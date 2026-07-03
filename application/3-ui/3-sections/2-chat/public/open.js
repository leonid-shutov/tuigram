async (chatId) => {
  if (self.chatId === chatId) return;
  self.chatId = chatId;
  self.clear();
  self.iterator = messenger.getHistory(chatId, 20);
  const { value } = await self.iterator.next();
  const messages = value.toReversed();
  for (const message of messages) self.addMessage(message);
  self.selectMessage(self.messages.tail);
};
