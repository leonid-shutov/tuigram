/** @type {Actions['receiveMessage']} */
(message) => {
  const isOpen = store.chat.chatId === message.chatId;
  // The stream re-delivers messages we already hold: our own, racing `send`, or a gap replay.
  if (isOpen && store.chat.hasConfirmed(message.id)) return;
  store.dialogs.receive(message);

  const isSeen = isOpen && store.window.focused;

  if (isOpen) {
    store.chat.append(message);
    actions.repaintChat();
    actions.loadThumb(message);
  }
  if (isSeen) {
    store.dialogs.markRead(message.chatId);
    void messenger.readHistory(message.chatId).catch((error) => Crash.soft(error));
  } else if (
    !message.sender.isSelf &&
    !store.dialogs.isMuted(message.chatId) &&
    !store.dialogs.isArchived(message.chatId)
  ) {
    actions.notify(message);
  }
};
