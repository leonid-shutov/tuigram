/** @type {Actions['openFolder']} */
(folderId) => {
  store.folders.select(folderId);
  ui.dialogs.first();
  if (store.chat.chatId !== null) ui.dialogs.select(store.chat.chatId);
  navigation.select('dialogs');
};
