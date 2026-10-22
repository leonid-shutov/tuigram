// Whether a chat is a user's never changes, so the dialog is read here but never waited on.
/** @type {Actions['repaintPresence']} */
() => {
  const chatId = store.chat.openChatId;
  const isUser = chatId !== null && store.dialogs.find(chatId)?.isUser === true;
  ui.chat.paintPresence(isUser ? store.peers.presenceOf(chatId) : null);
};
