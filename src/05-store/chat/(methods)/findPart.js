/** @type {ChatStoreSelf['findPart']} */
(chatId, partId) => {
  const chat = self.getById(chatId);
  if (chat === null) return null;
  /** @param {ChatMessage} message @returns {message is import('../../../../types/domain').Message} */
  const isWanted = (message) => Message.isConfirmed(message) && message.partIds.includes(partId);
  return chat.messages.find(isWanted) ?? null;
};
