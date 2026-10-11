/** @type {Actions['dropMessages']} */
(chatId, ids) => {
  if (store.chat.isOpen(chatId)) store.chat.remove(ids);

  const lastId = store.dialogs.find(chatId)?.lastMessage?.id;
  const previewGone = lastId !== undefined && ids.includes(lastId);
  if (previewGone) {
    if (store.chat.isOpen(chatId) && store.chat.lastConfirmed !== null) {
      store.dialogs.setLast(chatId, store.chat.lastConfirmed);
    } else {
      messenger
        .getLastMessage(chatId)
        .then((last) => store.dialogs.setLast(chatId, last))
        .catch((error) => Crash.soft(error));
    }
  }
};
