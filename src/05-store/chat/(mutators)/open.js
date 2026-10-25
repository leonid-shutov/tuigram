Mutation(
  self,
  /** @type {ChatStoreSelf['open']} */
  (chatId, inboxUnread) => {
    const left = self.opened;
    if (left !== null) self.trim(left);
    self.cache(chatId);
    self.openChatId = chatId;
    self.inboxUnread = inboxUnread;
  },
);
