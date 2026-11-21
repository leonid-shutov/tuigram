// Every cached chat takes what arrives, open or not; a chat that isn't cached has nothing to add
// to, and the store and the loads below pass over it.
/** @type {Actions['receiveMessage']} */
(message) => {
  // The stream re-delivers messages we already have cached: our own, racing `send`, or a gap replay.
  if (store.chat.hasConfirmed(message.chatId, message.id)) return;
  store.dialogs.receive(message);
  // The message is what they were typing, as Telegram's own clients take it.
  if (message.sender.id !== null) store.peers.setTyping(message.chatId, message.sender.id, null);
  store.chat.append(message.chatId, message);
  actions.loadThumb(message);
  actions.loadReplies([message]);

  actions.readOpenChat();
  const isSeen = store.chat.isOpen(message.chatId) && store.window.focused;
  if (
    !isSeen &&
    !message.sender.isSelf &&
    !store.dialogs.isMuted(message.chatId) &&
    !store.dialogs.isArchived(message.chatId)
  ) {
    actions.notify(message);
  }
};
