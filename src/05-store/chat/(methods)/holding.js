/** @type {ChatStoreSelf['holding']} */
(messageIds) => {
  const wanted = new Set(messageIds);
  return [...self.chats]
    .filter(([, { messages }]) => messages.some(({ id, pending }) => !pending && wanted.has(id)))
    .map(([chatId]) => chatId);
};
