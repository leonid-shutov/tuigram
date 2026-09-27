/** @type {Actions['presenceUpdate']} */
(chatId, presence) => {
  if (store.chat.chatId !== chatId) return;
  store.chat.setPresence(presence);
  actions.repaintPresence();
};
