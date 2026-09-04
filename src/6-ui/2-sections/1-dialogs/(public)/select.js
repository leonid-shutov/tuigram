/** @type {DialogsSelf['select']} */
(chatId) => {
  const index = store.dialogs.all().findIndex((dialog) => dialog.chatId === chatId);
  self.list.setSelectedIndex(index);
};
