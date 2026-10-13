Mutation(
  self,
  /** @type {DialogsStoreSelf['setLast']} */
  (chatId, message) => {
    const dialog = self.find(chatId);
    if (dialog !== null) dialog.lastMessage = message;
  },
);
