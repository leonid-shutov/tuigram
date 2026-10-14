/** @type {ChatStoreSelf['lastConfirmed']} */
(chatId) => {
  const chat = self.getById(chatId);
  if (chat === null) return null;
  return chat.messages.findLast(Message.isConfirmed) ?? null;
};
