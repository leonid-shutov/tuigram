/** @type {PickerSection['key']} */
(event) => {
  if (event.name === 'escape') self.events.emit('close');
  else if (event.name === 'up') self.list.moveUp();
  else if (event.name === 'down') self.list.moveDown();
  else if (event.name === 'return') {
    const selected = self.list.getSelectedOption();
    if (selected !== null) self.events.emit('pick', selected.value.chatId);
  } else {
    self.input.handleKeyPress(event);
    self.filter(self.input.plainText);
  }
};
