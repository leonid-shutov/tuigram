/** @type {ChatStoreSelf['findConfirmed']} */
(messageId) => {
  /** @param {ChatMessage} message @returns {message is import('../../../../types/domain').Message} */
  const isWanted = (message) => Message.isConfirmed(message) && message.id === messageId;
  return self.messages.find(isWanted) ?? null;
};
