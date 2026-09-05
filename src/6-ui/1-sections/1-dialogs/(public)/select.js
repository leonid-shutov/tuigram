/** @type {DialogsSection['select']} */
(chatId) => {
  const index = self.chatIds.indexOf(chatId);
  if (index !== -1) self.list.setSelectedIndex(index);
};
