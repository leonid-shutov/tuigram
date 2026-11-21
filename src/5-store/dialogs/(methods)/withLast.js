/** @type {DialogsStoreSelf['withLast']} */
(messageIds) =>
  [...self.list, ...self.archive]
    .filter(({ lastMessage }) => lastMessage !== null && messageIds.includes(lastMessage.id))
    .map(({ chatId }) => chatId);
