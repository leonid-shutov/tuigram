/** @type {ChatStoreSelf['oldestConfirmed']} */
(chatId) => {
  const chat = self.getById(chatId);
  if (chat === null) return null;
  return chat.messages.find(Message.isConfirmed) ?? null;
};
