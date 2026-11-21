/** @type {Actions['repaintChatTitle']} */
() => {
  const chatId = store.chat.openChatId;
  if (chatId === null) return;
  const dialog = store.dialogs.find(chatId);
  if (dialog !== null) ui.chat.paintName(chatId, dialog.name);
};
