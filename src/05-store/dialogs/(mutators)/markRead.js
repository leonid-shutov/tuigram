Mutation(
  self,
  /** @type {DialogsStoreSelf['markRead']} */
  (chatId) => {
    const dialog = self.find(chatId);
    if (dialog === null) return;
    dialog.unreadCount = 0;
    dialog.isUnread = false;
  },
);
