/** @type {DialogsSection['open']} */
() => {
  const chatId = self.selectedChatId;
  if (chatId !== null) self.emit('open', chatId);
};
