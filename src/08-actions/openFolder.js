/** @type {Actions['openFolder']} */
(folderId) => {
  store.folders.select(folderId);
  ui.dialogs.first();
  if (store.chat.openChatId !== null) ui.dialogs.select(store.chat.openChatId);
  navigation.select('dialogs');
};
