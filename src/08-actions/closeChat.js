/** @type {Actions['closeChat']} */
() => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return;
  navigation.select('dialogs');
  ui.messagePrompt.swap(chatId, null);
  ui.chat.close();
  store.chat.close();
  actions.repaintHints();
};
