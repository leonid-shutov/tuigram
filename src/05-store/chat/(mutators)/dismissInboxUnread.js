Mutation(
  self,
  /** @type {ChatStoreSelf['dismissInboxUnread']} */
  (chatId) => {
    if (self.isOpen(chatId)) self.inboxUnread = null;
  },
);
