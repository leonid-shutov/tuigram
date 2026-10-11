/** @type {Actions['dropMessages']} */
(chatId, ids) => {
  const isOpen = store.chat.chatId === chatId;
  if (isOpen) store.chat.remove(ids);

  const lastId = store.dialogs.find(chatId)?.lastMessage?.id;
  const previewGone = lastId !== undefined && ids.includes(lastId);
  if (previewGone) {
    if (isOpen && store.chat.lastConfirmed !== null) {
      store.dialogs.setLast(chatId, store.chat.lastConfirmed);
    } else {
      messenger
        .getLastMessage(chatId)
        .then((last) => store.dialogs.setLast(chatId, last))
        .catch((error) => Crash.soft(error));
    }
  }
};
