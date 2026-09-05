/** @type {Actions['receiveMessage']} */
(message) => {
  if (store.dialogs.isArchived(message.chatId)) return;
  store.dialogs.receive(message);

  if (store.chat.chatId === message.chatId) {
    store.chat.append(message);
    ui.chat.append(message);
    ui.chat.setReceipt(store.chat.receipt());
    store.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId);
  } else if (!message.sender.isSelf && !store.dialogs.isMuted(message.chatId)) {
    self.notify(message);
  }

  self.repaintDialogs();
};
