// A pending message has no chat yet, so its missing `chatId` is what tells it apart — and what
// narrows the answer to a sent `Message`.
/** @type {ChatStoreSelf['findConfirmed']} */
(messageId) => {
  /** @param {ChatMessage} message @returns {message is import('../../../../types/domain').Message} */
  const isWanted = (message) => message.chatId !== undefined && message.id === messageId;
  return self.messages.find(isWanted) ?? null;
};
