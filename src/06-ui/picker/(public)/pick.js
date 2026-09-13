/** @type {PickerSection['pick']} */
() => {
  const selected = self.list.getSelectedOption();
  if (selected !== null) self.emit('pick', selected.value.chatId);
};
