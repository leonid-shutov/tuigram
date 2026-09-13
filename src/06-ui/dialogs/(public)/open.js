/** @type {DialogsSection['open']} */
() => {
  const option = self.list.getSelectedOption();
  if (option !== null) self.emit('open', option.chatId);
};
