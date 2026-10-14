/** @type {Actions['dropMessages']} */
(chatId, ids) => {
  store.chat.remove(chatId, ids);

  const lastId = store.dialogs.find(chatId)?.lastMessage?.id;
  const previewGone = lastId !== undefined && ids.includes(lastId);
  if (previewGone) {
    // A cached chat is whole at its newest end, so its newest cached message is the chat's.
    const cached = store.chat.lastConfirmed(chatId);
    if (cached !== null) {
      store.dialogs.setLast(chatId, cached);
    } else {
      messenger
        .getLastMessage(chatId)
        .then((last) => store.dialogs.setLast(chatId, last))
        .catch((error) => Crash.soft(error));
    }
  }
};
