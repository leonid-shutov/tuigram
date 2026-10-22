Mutation(
  self,
  /** @type {ChatStoreSelf['open']} */
  (chatId) => {
    const left = self.opened;
    if (left !== null) self.trim(left);
    self.cache(chatId);
    self.openChatId = chatId;
  },
);
