/** @type {typeof Message.outboxUnreadFrom} */
(messages, readUpTo) => {
  const isOutboxUnread = (/** @type {ChatMessage} */ { sender, pending, id }) =>
    sender.isSelf && (pending || id > readUpTo);
  return messages.findLastIndex((message) => !isOutboxUnread(message)) + 1;
};
