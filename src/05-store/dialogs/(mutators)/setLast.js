// What a dialog previews once its last message is deleted: the one before it, or nothing.
Mutation(
  self,
  /** @type {DialogsStoreSelf['setLast']} */
  (chatId, message) => {
    const dialog = self.find(chatId);
    if (dialog !== null) dialog.lastMessage = message;
  },
);
