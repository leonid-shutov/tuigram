/** @type {Actions['openFolder']} */
(folderId) => {
  store.folders.select(folderId);
  actions.repaintDialogs();
  ui.dialogs.first();
  if (store.chat.chatId !== null) ui.dialogs.select(store.chat.chatId);
  navigation.select('dialogs');
};
