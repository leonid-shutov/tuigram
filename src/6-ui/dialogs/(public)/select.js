/** @type {DialogsSection['select']} */
(chatId) => {
  /** @type {DialogOption[]} */
  const rows = self.list.options;
  const index = rows.findIndex((row) => row.chatId === chatId);
  if (index !== -1) self.list.setSelectedIndex(index);
};
