/** @type {ChatStoreSelf['needsFirstPage']} */
(chatId) => {
  const chat = self.getById(chatId);
  return chat !== null && !chat.messages.some(Message.isConfirmed);
};
