// Whether a chat is a user's never changes, so the dialog is read here but never waited on. There
// the typist is the partner and goes unnamed; in a group a typist is named from the open chat's
// messages, and stays nameless until one of theirs is cached.
/** @type {Actions['repaintPresence']} */
() => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return void ui.chat.paintPresence(null, []);
  const isUser = store.dialogs.find(chatId)?.isUser === true;
  const messages = store.chat.opened?.messages ?? [];
  /** @param {number} userId */
  const nameOf = (userId) => {
    if (isUser) return null;
    return messages.findLast(({ sender }) => sender.id === userId)?.sender.displayName ?? null;
  };
  const typists = store.peers.typingIn(chatId).map(({ userId, status }) => ({ name: nameOf(userId), status }));
  return void ui.chat.paintPresence(isUser ? store.peers.presenceOf(chatId) : null, typists);
};
