/** @type {DialogsSelf['select']} */
(chatId) => {
  const index = [...self.dialogs].findIndex((dialog) => dialog.chatId === chatId);
  self.list.setSelectedIndex(index);
};
