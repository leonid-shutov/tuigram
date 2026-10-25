/** @type {typeof Message.inboxUnreadFrom} */
(messages, after) => {
  if (after === null) return messages.length;
  /** @param {ChatMessage} message */
  const isUnread = (message) =>
    Message.isConfirmed(message) && !message.sender.isSelf && Message.isAfter(message, after);
  const index = messages.findIndex(isUnread);
  return index === -1 ? messages.length : index;
};
