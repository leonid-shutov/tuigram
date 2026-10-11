/** @type {typeof Message.awaitsQuote} */
(message) => {
  if (!Message.isConfirmed(message)) return false;
  const { replyTo } = message;
  if (replyTo === null || replyTo.id === null) return false;
  return replyTo.sender === null && !replyTo.deleted;
};
