// The list previews each dialog's last message, so only an edit of that one changes the dialog.
Mutation(
  self,
  /** @type {DialogsStoreSelf['replaceLast']} */
  (message) => {
    const dialog = self.find(message.chatId);
    if (dialog === null || dialog.lastMessage?.id !== message.id) return;
    dialog.lastMessage = message;
  },
);
