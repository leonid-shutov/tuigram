/** @type {ChatStoreSelf['findConfirmed']} */
(chatId, messageId) => {
  const chat = self.getById(chatId);
  if (chat === null) return null;
  /** @param {ChatMessage} message @returns {message is import('../../../../types/domain').Message} */
  const isWanted = (message) => Message.isConfirmed(message) && message.id === messageId;
  return chat.messages.find(isWanted) ?? null;
};
