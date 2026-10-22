/** @type {typeof Message.unseenFrom} */
(messages, readUpTo) => {
  const isUnseen = (/** @type {ChatMessage} */ { sender, pending, id }) => sender.isSelf && (pending || id > readUpTo);
  return messages.findLastIndex((message) => !isUnseen(message)) + 1;
};
