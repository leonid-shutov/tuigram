/** @type {Actions['presenceUpdate']} */
(chatId, presence) => {
  if (!store.chat.isOpen(chatId)) return;
  store.chat.setPresence(presence);
};
