/** @type {Actions['presenceUpdate']} */
(chatId, presence) => {
  store.chat.setPresence(chatId, presence);
};
