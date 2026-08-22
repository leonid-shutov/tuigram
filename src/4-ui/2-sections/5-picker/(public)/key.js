(event) => {
  if (event.name === 'escape') self.emit('close');
  else if (event.name === 'up') self.list.moveUp();
  else if (event.name === 'down') self.list.moveDown();
  else if (event.name === 'return') {
    const dialog = self.list.getSelectedOption().value;
    self.emit('pick', dialog);
  } else {
    self.input.handleKeyPress(event);
    self.filter(self.input.plainText);
  }
};
