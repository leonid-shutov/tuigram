/** @type {Actions['receiveMessage']} */
(message) => {
  if (store.dialogs.isArchived(message.chatId)) return;
  const isOpen = store.chat.chatId === message.chatId;
  // The stream re-delivers messages we already hold: our own, racing `send`, or a gap replay.
  if (isOpen && store.chat.hasConfirmed(message.id)) return;
  store.dialogs.receive(message);

  const isSeen = isOpen && store.window.focused;

  if (isOpen) {
    store.chat.append(message);
    ui.chat.append(message);
    self.loadThumb(message);
    actions.repaintReceipt();
  }
  if (isSeen) {
    store.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId);
  } else if (!message.sender.isSelf && !store.dialogs.isMuted(message.chatId)) {
    self.notify(message);
  }

  self.repaintDialogs();
};
