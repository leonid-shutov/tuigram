// Every cached chat takes what arrives, open or not; a chat that isn't cached has nothing to add
// to, and the store and the loads below pass over it.
/** @type {Actions['receiveMessage']} */
(message) => {
  // The stream re-delivers messages we already have cached: our own, racing `send`, or a gap replay.
  if (store.chat.hasConfirmed(message.chatId, message.id)) return;
  store.dialogs.receive(message);

  const isSeen = store.chat.isOpen(message.chatId) && store.window.focused;

  store.chat.append(message.chatId, message);
  actions.loadThumb(message);
  actions.loadReplies([message]);

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
