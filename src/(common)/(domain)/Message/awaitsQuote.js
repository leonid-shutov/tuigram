/** @type {typeof Message.awaitsQuote} */
(message) => {
  const { chatId, replyTo } = message;
  if (chatId === undefined || replyTo === null || replyTo.id === null) return false;
  return replyTo.sender === null && !replyTo.deleted;
};
