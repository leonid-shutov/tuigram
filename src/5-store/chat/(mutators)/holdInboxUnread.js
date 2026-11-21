// An earlier divider stays as it is: everything below it is new to this visit, and what landed
// while the window was away arrived live, so `repaintChat` counts it among the messages under it.
Mutation(
  self,
  /** @type {ChatStoreSelf['holdInboxUnread']} */
  (chatId, inboxUnread) => {
    if (self.isOpen(chatId) && self.inboxUnread === null) self.inboxUnread = inboxUnread;
  },
);
