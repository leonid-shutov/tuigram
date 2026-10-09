Mutation(
  self,
  /** @type {DialogsStoreSelf['receive']} */
  (message) => {
    let dialog;
    // An archived chat stays in the archive: Telegram only moves it out on a new message when it
    // isn't muted, and says so with a dialog update we don't follow yet.
    const archived = self.archive.findNode(message.chatId);
    const node = archived ?? self.list.findNode(message.chatId);
    if (node !== null) {
      dialog = node.value;
      dialog.lastMessage = message;
      (archived === null ? self.list : self.archive).bump(node);
    } else {
      dialog = Dialog.fromMessage(message);
      self.list.unshift(dialog);
    }

    dialog.activity = Date.now();
    if (!message.sender.isSelf) dialog.unreadCount += 1;

    return dialog;
  },
);
